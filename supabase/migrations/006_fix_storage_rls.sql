-- Fix storage policy to allow uploads without Supabase Auth session
-- (Since we manage our own Auth via telegram_id in the users table)

DROP POLICY IF EXISTS "manufacturers_upload_images" ON storage.objects;
DROP POLICY IF EXISTS "manufacturers_delete_images" ON storage.objects;

CREATE POLICY "public_upload_images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "public_delete_images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
