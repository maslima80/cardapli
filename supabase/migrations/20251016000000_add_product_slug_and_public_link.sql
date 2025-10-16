-- Add slug and public_link columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS public_link BOOLEAN DEFAULT true;

-- Create unique index on user_id + slug
CREATE UNIQUE INDEX IF NOT EXISTS products_user_slug_idx ON products(user_id, slug);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION slugify(text TEXT) RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  -- Convert to lowercase
  result := lower(text);
  
  -- Replace accented characters
  result := translate(result, 
    'áàâãäåāăąèéêëēĕėęěìíîïìĩīĭḩóòôõöōŏőùúûüũūŭůçćĉċčñńņň',
    'aaaaaaaaaeeeeeeeeeiiiiiiiihoooooooouuuuuuuuccccccnnnn'
  );
  
  -- Replace spaces and special chars with hyphens
  result := regexp_replace(result, '[^a-z0-9]+', '-', 'g');
  
  -- Remove leading/trailing hyphens
  result := trim(both '-' from result);
  
  -- Limit length
  result := substring(result from 1 for 50);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Backfill slugs for existing products
DO $$
DECLARE
  product_record RECORD;
  base_slug TEXT;
  final_slug TEXT;
  slug_counter INTEGER;
  slug_exists BOOLEAN;
BEGIN
  FOR product_record IN 
    SELECT id, user_id, title 
    FROM products 
    WHERE slug IS NULL
  LOOP
    -- Generate base slug from title
    base_slug := slugify(product_record.title);
    
    -- If slug is empty, use 'produto'
    IF base_slug = '' OR base_slug IS NULL THEN
      base_slug := 'produto';
    END IF;
    
    -- Add short random suffix to ensure uniqueness
    final_slug := base_slug || '-' || substring(md5(random()::text) from 1 for 6);
    
    -- Check if slug exists for this user (should be unique now with random suffix)
    SELECT EXISTS(
      SELECT 1 FROM products 
      WHERE user_id = product_record.user_id 
      AND slug = final_slug
    ) INTO slug_exists;
    
    -- If by some chance it exists, add another suffix
    slug_counter := 1;
    WHILE slug_exists LOOP
      final_slug := base_slug || '-' || substring(md5(random()::text) from 1 for 6) || '-' || slug_counter;
      SELECT EXISTS(
        SELECT 1 FROM products 
        WHERE user_id = product_record.user_id 
        AND slug = final_slug
      ) INTO slug_exists;
      slug_counter := slug_counter + 1;
    END LOOP;
    
    -- Update the product with the slug
    UPDATE products 
    SET slug = final_slug 
    WHERE id = product_record.id;
  END LOOP;
END $$;

-- Make slug NOT NULL after backfill
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;

-- Add comment
COMMENT ON COLUMN products.slug IS 'URL-friendly slug for public product pages';
COMMENT ON COLUMN products.public_link IS 'Whether the product can be shared publicly';
