
-- Create table for water tracking data
CREATE TABLE IF NOT EXISTS public.water_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  entries JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_water INTEGER NOT NULL DEFAULT 0,
  water_goal INTEGER NOT NULL DEFAULT 2000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create table for user profile data (enhanced)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT,
  gender TEXT,
  age INTEGER,
  height NUMERIC,
  weight NUMERIC,
  activity_level TEXT,
  fitness_goal TEXT,
  target_weight NUMERIC,
  exercise_frequency TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for weight tracking data
CREATE TABLE IF NOT EXISTS public.weight_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  weight NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create table for workout data
CREATE TABLE IF NOT EXISTS public.workouts_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workout_id TEXT NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  exercises JSONB NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, workout_id)
);

-- Enable Row Level Security
ALTER TABLE public.water_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for water_tracking
CREATE POLICY "Users can view their own water tracking" ON public.water_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water tracking" ON public.water_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water tracking" ON public.water_tracking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water tracking" ON public.water_tracking
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for weight_data
CREATE POLICY "Users can view their own weight data" ON public.weight_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight data" ON public.weight_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight data" ON public.weight_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight data" ON public.weight_data
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for workouts_data
CREATE POLICY "Users can view their own workouts" ON public.workouts_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts" ON public.workouts_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" ON public.workouts_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" ON public.workouts_data
  FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_water_tracking_updated_at BEFORE UPDATE ON public.water_tracking
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_workouts_data_updated_at BEFORE UPDATE ON public.workouts_data
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
