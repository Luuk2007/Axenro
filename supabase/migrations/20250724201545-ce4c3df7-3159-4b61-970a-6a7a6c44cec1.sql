-- Fix database function security by adding proper search_path configuration
-- This prevents search path attacks on security definer functions

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

-- Fix overly permissive RLS policy on subscribers table
-- Replace the current update policy with a more restrictive one
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Only allow service role to update subscription data (for edge functions)
CREATE POLICY "service_role_can_update_subscriptions" 
ON public.subscribers 
FOR UPDATE 
TO service_role
USING (true);

-- Users can only view their own subscription data (make select policy more restrictive)
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
CREATE POLICY "users_can_view_own_subscription" 
ON public.subscribers 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());