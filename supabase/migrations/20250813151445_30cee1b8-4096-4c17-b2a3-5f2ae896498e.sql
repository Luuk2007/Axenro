
-- Create table for AI-generated workout plans
CREATE TABLE public.ai_workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goals TEXT,
  experience_level TEXT,
  training_days INTEGER,
  session_length INTEGER,
  available_equipment TEXT[],
  injuries TEXT,
  workout_plan JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AI-generated meal plans
CREATE TABLE public.ai_meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  calorie_goal INTEGER,
  protein_goal INTEGER,
  carb_goal INTEGER,
  fat_goal INTEGER,
  diet_type TEXT,
  allergies TEXT[],
  meals_per_day INTEGER,
  meal_plan JSONB NOT NULL,
  shopping_list JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AI progress analysis
CREATE TABLE public.ai_progress_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  analysis_text TEXT NOT NULL,
  recommendations TEXT,
  progress_images TEXT[],
  measurements JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AI chat history
CREATE TABLE public.ai_chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'fitness', -- fitness, nutrition, general
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_progress_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_workout_plans
CREATE POLICY "Users can view their own AI workout plans" 
  ON public.ai_workout_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI workout plans" 
  ON public.ai_workout_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI workout plans" 
  ON public.ai_workout_plans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI workout plans" 
  ON public.ai_workout_plans 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for ai_meal_plans
CREATE POLICY "Users can view their own AI meal plans" 
  ON public.ai_meal_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI meal plans" 
  ON public.ai_meal_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI meal plans" 
  ON public.ai_meal_plans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI meal plans" 
  ON public.ai_meal_plans 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for ai_progress_analysis
CREATE POLICY "Users can view their own AI progress analysis" 
  ON public.ai_progress_analysis 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI progress analysis" 
  ON public.ai_progress_analysis 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI progress analysis" 
  ON public.ai_progress_analysis 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI progress analysis" 
  ON public.ai_progress_analysis 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for ai_chat_history
CREATE POLICY "Users can view their own AI chat history" 
  ON public.ai_chat_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI chat history" 
  ON public.ai_chat_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI chat history" 
  ON public.ai_chat_history 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI chat history" 
  ON public.ai_chat_history 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create storage bucket for progress images
INSERT INTO storage.buckets (id, name, public) VALUES ('progress-images', 'progress-images', false);

-- Create RLS policy for progress images bucket
CREATE POLICY "Users can upload their own progress images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'progress-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own progress images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'progress-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own progress images" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'progress-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add updated_at trigger for ai_workout_plans and ai_meal_plans
CREATE TRIGGER update_ai_workout_plans_updated_at 
  BEFORE UPDATE ON public.ai_workout_plans 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_meal_plans_updated_at 
  BEFORE UPDATE ON public.ai_meal_plans 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
