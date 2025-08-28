
-- Make the progress-images bucket public so images can be accessed via public URLs
UPDATE storage.buckets 
SET public = true 
WHERE id = 'progress-images';
