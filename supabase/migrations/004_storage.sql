-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow manufacturers to upload images for their products
CREATE POLICY "manufacturers_upload_images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.uid() IS NOT NULL
);

-- Allow public reads
CREATE POLICY "public_read_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow manufacturers to delete their own images
CREATE POLICY "manufacturers_delete_images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.uid() IS NOT NULL
);
