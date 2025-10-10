-- Create planned_workouts table
CREATE TABLE public.planned_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  muscle_groups TEXT[] DEFAULT '{}',
  estimated_duration INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.planned_workouts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own planned workouts"
ON public.planned_workouts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planned workouts"
ON public.planned_workouts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planned workouts"
ON public.planned_workouts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planned workouts"
ON public.planned_workouts
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_planned_workouts_updated_at
BEFORE UPDATE ON public.planned_workouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();