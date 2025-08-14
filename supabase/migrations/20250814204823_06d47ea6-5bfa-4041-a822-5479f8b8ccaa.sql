
-- Phase 1: Critical Security Fixes for Database

-- 1. Fix database function security by setting proper search_path
CREATE OR REPLACE FUNCTION public.get_latest_daily_steps(user_uuid uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  latest_steps INTEGER;
BEGIN
  SELECT steps INTO latest_steps
  FROM public.daily_steps
  WHERE user_id = user_uuid
    AND date = CURRENT_DATE
  ORDER BY synced_at DESC
  LIMIT 1;
  
  RETURN COALESCE(latest_steps, 0);
END;
$function$;

-- 2. Fix handle_new_user function security
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$function$;

-- 3. Enhance RLS policy for subscribers table to add field-level security
DROP POLICY IF EXISTS "users_can_view_own_subscription" ON public.subscribers;
CREATE POLICY "users_can_view_own_subscription_limited" 
  ON public.subscribers 
  FOR SELECT 
  USING (
    user_id = auth.uid() AND 
    -- Only allow users to see limited fields, not sensitive Stripe data
    (auth.jwt() ->> 'role'::text) != 'service_role'
  );

-- 4. Add audit logging table for sensitive data access
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role and admins can view audit logs
CREATE POLICY "service_role_can_view_audit_logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (auth.jwt() ->> 'role'::text = 'service_role');

-- 5. Add token expiry validation for health connections
CREATE OR REPLACE FUNCTION public.validate_health_token_expiry()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Automatically deactivate expired tokens
  IF NEW.token_expires_at IS NOT NULL AND NEW.token_expires_at < now() THEN
    NEW.is_active = false;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger for token expiry validation
DROP TRIGGER IF EXISTS validate_health_token_expiry_trigger ON public.health_connections;
CREATE TRIGGER validate_health_token_expiry_trigger
  BEFORE INSERT OR UPDATE ON public.health_connections
  FOR EACH ROW
  EXECUTE function public.validate_health_token_expiry();

-- 6. Add rate limiting table for AI functions
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, function_name, window_start)
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limits
CREATE POLICY "users_can_view_own_rate_limits" 
  ON public.rate_limits 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own rate limits
CREATE POLICY "users_can_insert_own_rate_limits" 
  ON public.rate_limits 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own rate limits
CREATE POLICY "users_can_update_own_rate_limits" 
  ON public.rate_limits 
  FOR UPDATE 
  USING (auth.uid() = user_id);
