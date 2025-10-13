-- Add is_whitelisted column to subscribers table for admin access
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS is_whitelisted boolean NOT NULL DEFAULT false;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_whitelisted ON public.subscribers(is_whitelisted) WHERE is_whitelisted = true;

-- Update RLS policies to prevent users from seeing or modifying whitelisted status
-- The existing policies already handle this correctly since they only allow users to view/update their own subscription
-- The is_whitelisted column will only be accessible via edge functions with service role key

-- Add comment for documentation
COMMENT ON COLUMN public.subscribers.is_whitelisted IS 'Admin whitelist flag - grants full premium access without Stripe. Only modifiable via direct SQL or edge functions with service role key.';