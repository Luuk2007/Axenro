
-- Create table for body measurements
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  measurement_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for body_measurements
CREATE POLICY "Users can view their own body measurements" ON public.body_measurements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own body measurements" ON public.body_measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own body measurements" ON public.body_measurements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own body measurements" ON public.body_measurements
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_type_date ON public.body_measurements(user_id, measurement_type, date);
