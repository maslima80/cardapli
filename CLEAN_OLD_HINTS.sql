-- ============================================================================
-- Clean Up Old Theme Hints
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Delete all theme_done hints (no longer exists)
DELETE FROM public.onboarding_hints_viewed 
WHERE hint_key = 'theme_done';

-- Delete all profile_done hints (message changed, let users see new one)
DELETE FROM public.onboarding_hints_viewed 
WHERE hint_key = 'profile_done';

-- Verify
SELECT 
  hint_key,
  COUNT(*) as count
FROM public.onboarding_hints_viewed
GROUP BY hint_key;

-- ============================================================================
-- DONE! Old hints cleaned up
-- ============================================================================
