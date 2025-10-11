-- Add AI avatar fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ai_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS ai_avatar_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ai_avatar_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_motivation_message TEXT,
ADD COLUMN IF NOT EXISTS last_motivation_generated_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_ai_avatar_status ON public.profiles(ai_avatar_status);

-- Create ai-avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-avatars', 'ai-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ai-avatars bucket
CREATE POLICY "Users can view their own AI avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'ai-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can insert their own AI avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ai-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own AI avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'ai-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own AI avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'ai-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);