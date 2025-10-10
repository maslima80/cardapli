-- Create catalogs table
CREATE TABLE public.catalogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'public', 'unlisted')),
  theme_overrides JSONB DEFAULT '{"use_brand": true}'::jsonb,
  cover JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{"show_section_nav": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_catalog_slug UNIQUE (user_id, slug)
);

-- Create catalog_blocks table
CREATE TABLE public.catalog_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  catalog_id UUID NOT NULL REFERENCES public.catalogs(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cover', 'heading', 'text', 'image', 'video', 'product_grid', 'about', 'contact', 'socials', 'divider', 'testimonials', 'benefits', 'faq', 'step_by_step', 'important_info')),
  sort INTEGER NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT true,
  anchor_slug TEXT,
  page_break BOOLEAN NOT NULL DEFAULT false,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for catalogs
CREATE POLICY "Users can view their own catalogs"
  ON public.catalogs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own catalogs"
  ON public.catalogs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own catalogs"
  ON public.catalogs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own catalogs"
  ON public.catalogs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public/unlisted catalogs"
  ON public.catalogs FOR SELECT
  USING (status IN ('public', 'unlisted'));

-- RLS Policies for catalog_blocks
CREATE POLICY "Users can view blocks of their catalogs"
  ON public.catalog_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.catalogs
      WHERE catalogs.id = catalog_blocks.catalog_id
      AND catalogs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create blocks for their catalogs"
  ON public.catalog_blocks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.catalogs
      WHERE catalogs.id = catalog_blocks.catalog_id
      AND catalogs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update blocks of their catalogs"
  ON public.catalog_blocks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.catalogs
      WHERE catalogs.id = catalog_blocks.catalog_id
      AND catalogs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete blocks of their catalogs"
  ON public.catalog_blocks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.catalogs
      WHERE catalogs.id = catalog_blocks.catalog_id
      AND catalogs.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view blocks of public/unlisted catalogs"
  ON public.catalog_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.catalogs
      WHERE catalogs.id = catalog_blocks.catalog_id
      AND catalogs.status IN ('public', 'unlisted')
    )
  );

-- Indexes for performance
CREATE INDEX idx_catalogs_user_id ON public.catalogs(user_id);
CREATE INDEX idx_catalogs_slug ON public.catalogs(user_id, slug);
CREATE INDEX idx_catalog_blocks_catalog_id ON public.catalog_blocks(catalog_id);
CREATE INDEX idx_catalog_blocks_sort ON public.catalog_blocks(catalog_id, sort);

-- Trigger for updated_at on catalogs
CREATE TRIGGER update_catalogs_updated_at
  BEFORE UPDATE ON public.catalogs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for updated_at on catalog_blocks
CREATE TRIGGER update_catalog_blocks_updated_at
  BEFORE UPDATE ON public.catalog_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();