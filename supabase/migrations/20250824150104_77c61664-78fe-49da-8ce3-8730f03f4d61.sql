
-- Make the progress-images bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'progress-images';

-- Create RLS policy for public read access to progress images
CREATE POLICY "Public read access for progress images" ON storage.objects
FOR SELECT USING (bucket_id = 'progress-images');

-- Create RLS policy for authenticated users to insert their own progress images
CREATE POLICY "Users can insert their own progress images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'progress-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policy for authenticated users to update their own progress images
CREATE POLICY "Users can update their own progress images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'progress-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policy for authenticated users to delete their own progress images
CREATE POLICY "Users can delete their own progress images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'progress-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
