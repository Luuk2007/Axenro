
-- Create enhanced progress photos table with notes, tags, and categories
CREATE TABLE public.progress_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  image_url TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'front', -- front, side, back, flexed, relaxed, etc.
  is_milestone BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
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

-- Create index for better performance
CREATE INDEX idx_progress_photos_user_date ON public.progress_photos(user_id, date DESC);
CREATE INDEX idx_progress_photos_user_category ON public.progress_photos(user_id, category);
CREATE INDEX idx_progress_photos_user_tags ON public.progress_photos USING GIN(user_id, tags);
