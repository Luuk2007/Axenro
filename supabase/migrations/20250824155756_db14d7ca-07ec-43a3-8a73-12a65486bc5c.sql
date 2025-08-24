
-- Create table for workout data
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workout_id TEXT NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for nutrition/food logs  
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  food_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for custom exercises
CREATE TABLE IF NOT EXISTS public.custom_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for custom meals
CREATE TABLE IF NOT EXISTS public.custom_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for deleted default meals
CREATE TABLE IF NOT EXISTS public.deleted_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meal_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for measurement types settings
CREATE TABLE IF NOT EXISTS public.measurement_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  measurement_id TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  theme TEXT NOT NULL DEFAULT 'light',
  language TEXT NOT NULL DEFAULT 'english',
  data_backup BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deleted_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workouts
CREATE POLICY "Users can view their own workouts" ON public.workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own workouts" ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workouts" ON public.workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workouts" ON public.workouts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for nutrition_logs
CREATE POLICY "Users can view their own nutrition logs" ON public.nutrition_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own nutrition logs" ON public.nutrition_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own nutrition logs" ON public.nutrition_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own nutrition logs" ON public.nutrition_logs FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for custom_exercises
CREATE POLICY "Users can view their own custom exercises" ON public.custom_exercises FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own custom exercises" ON public.custom_exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own custom exercises" ON public.custom_exercises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own custom exercises" ON public.custom_exercises FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for custom_meals
CREATE POLICY "Users can view their own custom meals" ON public.custom_meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own custom meals" ON public.custom_meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own custom meals" ON public.custom_meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own custom meals" ON public.custom_meals FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for deleted_meals
CREATE POLICY "Users can view their own deleted meals" ON public.deleted_meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own deleted meals" ON public.deleted_meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own deleted meals" ON public.deleted_meals FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for measurement_types
CREATE POLICY "Users can view their own measurement types" ON public.measurement_types FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own measurement types" ON public.measurement_types FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own measurement types" ON public.measurement_types FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own measurement types" ON public.measurement_types FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON public.nutrition_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_custom_exercises_user ON public.custom_exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_meals_user ON public.custom_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_deleted_meals_user ON public.deleted_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_measurement_types_user ON public.measurement_types(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON public.user_settings(user_id);
