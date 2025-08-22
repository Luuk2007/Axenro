
-- Create a table for customer reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_approved BOOLEAN NOT NULL DEFAULT false
);

-- Add Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view approved reviews
CREATE POLICY "Anyone can view approved reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (is_approved = true);

-- Create policy that allows users to view their own reviews (even if not approved)
CREATE POLICY "Users can view their own reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own reviews
CREATE POLICY "Users can create their own reviews" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own reviews
CREATE POLICY "Users can update their own reviews" 
  ON public.reviews 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to delete their own reviews
CREATE POLICY "Users can delete their own reviews" 
  ON public.reviews 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to update the updated_at column
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
