-- Create global testimonials table for reusable testimonials across catalogs
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Testimonial content
  author_name TEXT NOT NULL,
  author_role TEXT, -- e.g., "Cliente desde 2023", "Empresário", etc.
  author_photo_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Optional 1-5 star rating
  
  -- Metadata
  featured BOOLEAN NOT NULL DEFAULT false, -- Mark important testimonials
  source TEXT, -- e.g., "Google Reviews", "Instagram", "WhatsApp", etc.
  date_received DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT testimonials_user_id_idx UNIQUE (user_id, id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON public.testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials(user_id, featured) WHERE featured = true;

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own testimonials
CREATE POLICY "Users can view own testimonials"
  ON public.testimonials
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own testimonials
CREATE POLICY "Users can insert own testimonials"
  ON public.testimonials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own testimonials
CREATE POLICY "Users can update own testimonials"
  ON public.testimonials
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own testimonials
CREATE POLICY "Users can delete own testimonials"
  ON public.testimonials
  FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view testimonials (for public catalogs)
CREATE POLICY "Public can view testimonials"
  ON public.testimonials
  FOR SELECT
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_testimonials_updated_at();

-- Add comment
COMMENT ON TABLE public.testimonials IS 'Global testimonials that can be reused across catalogs and wizard';
