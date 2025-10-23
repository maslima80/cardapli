-- ============================================================================
-- Make Price Optional for Products
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Price should be nullable when price_on_request is true
-- This allows "Sob consulta" products without a price

-- STEP 1: Make price column nullable
-- ============================================================================
ALTER TABLE public.products 
ALTER COLUMN price DROP NOT NULL;

-- STEP 2: Add check constraint to ensure price is set when NOT price_on_request
-- ============================================================================
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS price_required_when_not_on_request;

ALTER TABLE public.products
ADD CONSTRAINT price_required_when_not_on_request
CHECK (
  price_on_request = true OR price IS NOT NULL
);

-- STEP 3: Verify the change
-- ============================================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products' 
  AND column_name IN ('price', 'price_on_request')
ORDER BY column_name;

-- ============================================================================
-- DONE! Price is now optional when price_on_request is true
-- ============================================================================
