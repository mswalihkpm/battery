-- Create the product-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- RLS policy: Anyone can view product images (public bucket)
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- RLS policy: Admins can upload product images
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- RLS policy: Admins can update product images
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- RLS policy: Admins can delete product images
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));