
-- Add test mode columns to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN test_mode BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN test_subscription_tier TEXT DEFAULT 'free';

-- Update existing users to have test mode enabled with free tier
UPDATE public.subscribers 
SET test_mode = true, test_subscription_tier = 'free' 
WHERE test_mode IS NULL;

-- Create RLS policy for test mode fields
CREATE POLICY "users_can_update_test_mode" ON public.subscribers
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
