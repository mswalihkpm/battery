
-- Add product_number (auto-increment SI number) to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_number SERIAL;

-- Add district column to addresses table
ALTER TABLE public.addresses ADD COLUMN IF NOT EXISTS district text;

-- Add app_theme table for admin-controlled seasonal themes
CREATE TABLE IF NOT EXISTS public.app_themes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT false,
  primary_color text DEFAULT '152 69% 31%',
  primary_dark text DEFAULT '152 75% 20%',
  accent_color text DEFAULT '152 60% 45%',
  bg_color text DEFAULT '0 0% 98%',
  banner_text text,
  banner_emoji text DEFAULT '🎉',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active themes"
  ON public.app_themes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage themes"
  ON public.app_themes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default themes
INSERT INTO public.app_themes (name, description, primary_color, primary_dark, accent_color, bg_color, banner_text, banner_emoji, is_active)
VALUES 
  ('Default Green', 'Standard TARBO green theme', '152 69% 31%', '152 75% 20%', '152 60% 45%', '0 0% 98%', null, '🛍️', true),
  ('Christmas', 'Festive Christmas theme', '0 72% 35%', '0 80% 22%', '0 60% 48%', '0 0% 98%', '🎄 Merry Christmas! Special offers this season', '🎄', false),
  ('Eid Special', 'Eid Mubarak celebration theme', '36 78% 42%', '36 85% 28%', '36 65% 55%', '0 0% 98%', '🌙 Eid Mubarak! Exclusive Eid offers', '🌙', false),
  ('New Year', 'New Year celebration theme', '263 70% 45%', '263 78% 30%', '263 55% 58%', '0 0% 98%', '🎆 Happy New Year! Shop the new collection', '🎆', false),
  ('Summer Sale', 'Summer vibes sale theme', '28 85% 45%', '28 90% 30%', '28 70% 58%', '0 0% 98%', '☀️ Summer Sale is LIVE! Up to 70% off', '☀️', false);
