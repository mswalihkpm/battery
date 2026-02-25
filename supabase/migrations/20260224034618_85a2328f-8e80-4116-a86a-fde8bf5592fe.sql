
-- Add media_urls column to reviews table for image/video uploads
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS media_urls text[] DEFAULT '{}';

-- Create storage bucket for review media
INSERT INTO storage.buckets (id, name, public) VALUES ('review-media', 'review-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload review media
CREATE POLICY "Users can upload review media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'review-media' AND auth.uid() IS NOT NULL);

-- Allow public read access to review media
CREATE POLICY "Review media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-media');

-- Allow users to delete their own review media
CREATE POLICY "Users can delete own review media"
ON storage.objects FOR DELETE
USING (bucket_id = 'review-media' AND auth.uid()::text = (storage.foldername(name))[1]);
