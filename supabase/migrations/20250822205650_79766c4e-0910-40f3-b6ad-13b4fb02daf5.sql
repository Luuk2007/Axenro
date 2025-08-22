
-- Create the progress_photos table
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'front',
  is_milestone BOOLEAN NOT NULL DEFAULT false,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own progress photos" 
  ON public.progress_photos 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress photos" 
  ON public.progress_photos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress photos" 
  ON public.progress_photos 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress photos" 
  ON public.progress_photos 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_progress_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_progress_photos_updated_at_trigger
    BEFORE UPDATE ON public.progress_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_progress_photos_updated_at();
