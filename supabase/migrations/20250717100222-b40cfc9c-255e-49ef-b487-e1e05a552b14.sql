
-- Create table for health app connections
CREATE TABLE public.health_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('apple_health', 'google_fit', 'samsung_health')),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  provider_user_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Create table for daily steps data
CREATE TABLE public.daily_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  steps INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL CHECK (source IN ('manual', 'apple_health', 'google_fit', 'samsung_health')),
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, source)
);

-- Enable RLS on health_connections table
ALTER TABLE public.health_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for health_connections
CREATE POLICY "Users can view their own health connections" 
  ON public.health_connections 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health connections" 
  ON public.health_connections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health connections" 
  ON public.health_connections 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health connections" 
  ON public.health_connections 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on daily_steps table
ALTER TABLE public.daily_steps ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_steps
CREATE POLICY "Users can view their own daily steps" 
  ON public.daily_steps 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily steps" 
  ON public.daily_steps 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily steps" 
  ON public.daily_steps 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily steps" 
  ON public.daily_steps 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to get latest steps for a user
CREATE OR REPLACE FUNCTION get_latest_daily_steps(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
