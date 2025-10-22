-- ============================================
-- CLEANUP: Remove duplicate business_info_sections
-- ============================================
-- This keeps only the LATEST entry for each (user_id, type, scope, scope_id)
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: See duplicates (optional - for verification)
SELECT 
  user_id, 
  type, 
  scope, 
  scope_id, 
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as ids
FROM business_info_sections
GROUP BY user_id, type, scope, scope_id
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Step 2: Delete old duplicates, keep only the latest
DELETE FROM business_info_sections
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, type, scope, scope_id 
        ORDER BY updated_at DESC
      ) as rn
    FROM business_info_sections
  ) t
  WHERE rn > 1
);

-- Step 3: Verify cleanup (should return 0 rows)
SELECT 
  user_id, 
  type, 
  scope, 
  scope_id, 
  COUNT(*) as count
FROM business_info_sections
GROUP BY user_id, type, scope, scope_id
HAVING COUNT(*) > 1;

-- ============================================
-- DONE! ✅
-- ============================================
-- After running this:
-- - Only the LATEST entry for each type remains
-- - No more duplicates
-- - Catalog will show correct data
-- ============================================
