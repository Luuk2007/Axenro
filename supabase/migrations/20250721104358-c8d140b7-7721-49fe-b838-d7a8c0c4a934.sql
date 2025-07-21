
-- Phase 1: Critical RLS Policy Fixes

-- Fix subscribers table policies
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create proper UPDATE policy - users can only update their own subscription
CREATE POLICY "users_can_update_own_subscription" ON public.subscribers
FOR UPDATE
USING (user_id = auth.uid());

-- Create proper INSERT policy - users can only create their own subscription
CREATE POLICY "users_can_insert_own_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Add DELETE policy for data cleanup
CREATE POLICY "users_can_delete_own_subscription" ON public.subscribers
FOR DELETE
USING (user_id = auth.uid());

-- Phase 2: Database Function Security

-- Update get_latest_daily_steps function with proper security
DROP FUNCTION IF EXISTS public.get_latest_daily_steps(uuid);
CREATE OR REPLACE FUNCTION public.get_latest_daily_steps(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  latest_steps INTEGER;
BEGIN
  -- Ensure user can only access their own data
  IF user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: cannot access other users data';
  END IF;
  
  SELECT steps INTO latest_steps
  FROM public.daily_steps
  WHERE user_id = user_uuid
    AND date = CURRENT_DATE
  ORDER BY synced_at DESC
  LIMIT 1;
  
  RETURN COALESCE(latest_steps, 0);
END;
$$;

-- Update handle_new_user function with proper security
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- Add audit logging function for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_operation(
  operation_type TEXT,
  table_name TEXT,
  record_id UUID,
  details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Log to a hypothetical audit table (can be created later)
  -- For now, just ensure the function exists with proper security
  RAISE LOG 'Audit: % on % for record % by user % - %', 
    operation_type, table_name, record_id, auth.uid(), details;
END;
$$;

-- Ensure all existing policies are using proper user isolation
-- Add additional security check for food_logs if needed
CREATE OR REPLACE FUNCTION public.validate_food_log_access(log_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN log_user_id = auth.uid();
END;
$$;
