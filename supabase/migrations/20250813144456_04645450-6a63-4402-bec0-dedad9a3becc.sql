
-- Create table to store cookie consent preferences
CREATE TABLE public.cookie_consent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  essential_cookies BOOLEAN NOT NULL DEFAULT true,
  analytics_cookies BOOLEAN NOT NULL DEFAULT false,
  marketing_cookies BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.cookie_consent ENABLE ROW LEVEL SECURITY;

-- Users can view their own cookie consent
CREATE POLICY "Users can view their own cookie consent" 
  ON public.cookie_consent 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own cookie consent
CREATE POLICY "Users can insert their own cookie consent" 
  ON public.cookie_consent 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cookie consent
CREATE POLICY "Users can update their own cookie consent" 
  ON public.cookie_consent 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_cookie_consent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cookie_consent_updated_at
    BEFORE UPDATE ON public.cookie_consent
    FOR EACH ROW
    EXECUTE FUNCTION public.update_cookie_consent_updated_at();
