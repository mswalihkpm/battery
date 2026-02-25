-- Create advertisements table for admin-managed hero banners
CREATE TABLE public.advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT DEFAULT 'Shop Now',
  cta_link TEXT DEFAULT '/products',
  image_url TEXT,
  gradient_from TEXT DEFAULT '#059669',
  gradient_to TEXT DEFAULT '#10b981',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Public read access for advertisements
CREATE POLICY "Anyone can view active advertisements"
ON public.advertisements
FOR SELECT
USING (is_active = true);

-- Admin-only write access
CREATE POLICY "Admins can manage advertisements"
ON public.advertisements
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default advertisements
INSERT INTO public.advertisements (title, subtitle, cta_text, cta_link, gradient_from, gradient_to, sort_order) VALUES
('New Season Arrivals', 'Discover the latest trends in fashion with up to 50% off on selected items', 'Shop Now', '/products?category=mens-fashion', '#059669', '#10b981', 1),
('Premium Accessories', 'Complete your look with our curated collection', 'Explore', '/products?category=accessories', '#0d9488', '#14b8a6', 2),
('Kids Fashion Week', 'Adorable styles for your little ones at amazing prices', 'Shop Kids', '/products?category=kids-fashion', '#0891b2', '#06b6d4', 3);