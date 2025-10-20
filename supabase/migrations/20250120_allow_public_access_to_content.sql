-- Allow public access to products, catalogs, and related content
-- This enables public profile and catalog pages to display all content

-- ============================================
-- PRODUCTS: Allow public to view products with public_link = true
-- ============================================

DROP POLICY IF EXISTS "Users can view their own products" ON public.products;

-- Owner can view all their products
CREATE POLICY "owner can view all products"
  ON public.products FOR SELECT
  USING (auth.uid() = user_id);

-- Public can view products with public_link = true
CREATE POLICY "public can view public products"
  ON public.products FOR SELECT
  USING (public_link = true);

-- ============================================
-- CATALOG_BLOCKS: Allow public to view blocks of public catalogs
-- ============================================

DROP POLICY IF EXISTS "Users can view blocks of their catalogs" ON public.catalog_blocks;

-- Owner can view all their catalog blocks
CREATE POLICY "owner can view their catalog blocks"
  ON public.catalog_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.catalogs
      WHERE catalogs.id = catalog_blocks.catalog_id
      AND catalogs.user_id = auth.uid()
    )
  );

-- Public can view blocks of public/unlisted catalogs (where link_ativo = true)
CREATE POLICY "public can view public catalog blocks"
  ON public.catalog_blocks FOR SELECT
  USING (
    visible = true
    AND EXISTS (
      SELECT 1 FROM public.catalogs
      WHERE catalogs.id = catalog_blocks.catalog_id
      AND catalogs.status IN ('public', 'unlisted', 'publicado')
      AND (catalogs.link_ativo IS NULL OR catalogs.link_ativo = true)
    )
  );

-- ============================================
-- PRODUCT_VARIANTS: Allow public to view variants of public products
-- ============================================

-- Check if product_variants table exists and has RLS enabled
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_variants') THEN
    -- Drop existing restrictive policy if it exists
    DROP POLICY IF EXISTS "Users can view variants of their products" ON public.product_variants;
    
    -- Owner can view all their product variants
    EXECUTE 'CREATE POLICY "owner can view their product variants"
      ON public.product_variants FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.products
          WHERE products.id = product_variants.product_id
          AND products.user_id = auth.uid()
        )
      )';
    
    -- Public can view variants of public products
    EXECUTE 'CREATE POLICY "public can view public product variants"
      ON public.product_variants FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.products
          WHERE products.id = product_variants.product_id
          AND products.public_link = true
        )
      )';
  END IF;
END $$;
