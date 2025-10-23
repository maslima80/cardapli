-- ============================================================================
-- Add Trigger to Auto-Generate Product Slugs
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Function to auto-generate slug on insert
CREATE OR REPLACE FUNCTION generate_product_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  slug_counter INTEGER := 1;
  slug_exists BOOLEAN;
BEGIN
  -- Only generate if slug is not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Generate base slug from title
    base_slug := slugify(NEW.title);
    
    -- If slug is empty, use 'produto'
    IF base_slug = '' OR base_slug IS NULL THEN
      base_slug := 'produto';
    END IF;
    
    -- Add short random suffix to ensure uniqueness
    final_slug := base_slug || '-' || substring(md5(random()::text) from 1 for 6);
    
    -- Check if slug exists for this user
    SELECT EXISTS(
      SELECT 1 FROM products 
      WHERE user_id = NEW.user_id 
      AND slug = final_slug
      AND id != NEW.id
    ) INTO slug_exists;
    
    -- If exists, keep trying with counter
    WHILE slug_exists LOOP
      final_slug := base_slug || '-' || substring(md5(random()::text) from 1 for 6) || '-' || slug_counter;
      SELECT EXISTS(
        SELECT 1 FROM products 
        WHERE user_id = NEW.user_id 
        AND slug = final_slug
        AND id != NEW.id
      ) INTO slug_exists;
      slug_counter := slug_counter + 1;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS products_slug_trigger ON products;

CREATE TRIGGER products_slug_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION generate_product_slug();

-- Verify trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'products_slug_trigger';

-- ============================================================================
-- DONE! Slugs will now be auto-generated on product creation
-- ============================================================================
