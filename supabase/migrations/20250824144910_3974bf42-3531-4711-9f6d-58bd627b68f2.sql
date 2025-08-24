
-- Make the progress-images bucket public so images can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'progress-images';

-- Create RLS policy to ensure users can only view images in their own folder
CREATE POLICY "Users can view their own progress images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'progress-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
