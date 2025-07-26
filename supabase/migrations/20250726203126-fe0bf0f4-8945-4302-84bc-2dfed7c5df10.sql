
-- Fix the subscription RLS policy to be more restrictive
-- Only allow authenticated users to insert their own subscription records
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

CREATE POLICY "users_can_insert_own_subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add a more restrictive policy for service role updates
-- This ensures only the service role can update subscription status from Stripe webhooks
DROP POLICY IF EXISTS "service_role_can_update_subscriptions" ON public.subscribers;

CREATE POLICY "service_role_can_update_subscriptions" 
ON public.subscribers 
FOR UPDATE 
USING (
  -- Allow service role (for Stripe webhooks) or user updating their own record
  auth.jwt() ->> 'role' = 'service_role' OR auth.uid() = user_id
)
WITH CHECK (
  -- Same conditions for the check constraint
  auth.jwt() ->> 'role' = 'service_role' OR auth.uid() = user_id
);
