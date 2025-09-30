-- Fix security warning by setting search_path for the trigger function
DROP FUNCTION IF EXISTS update_challenges_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_challenges_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the triggers
CREATE TRIGGER update_challenges_updated_at_trigger
BEFORE UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION update_challenges_updated_at();

CREATE TRIGGER update_user_challenges_updated_at_trigger
BEFORE UPDATE ON public.user_challenges
FOR EACH ROW
EXECUTE FUNCTION update_challenges_updated_at();