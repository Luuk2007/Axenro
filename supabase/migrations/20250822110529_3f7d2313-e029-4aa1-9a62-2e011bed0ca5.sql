
-- Create health_connections table to store OAuth tokens
CREATE TABLE IF NOT EXISTS public.health_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_steps table to store step data
CREATE TABLE IF NOT EXISTS public.daily_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  steps INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, source)
);

-- Add Row Level Security (RLS) for both tables
ALTER TABLE public.health_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_steps ENABLE ROW LEVEL SECURITY;

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
