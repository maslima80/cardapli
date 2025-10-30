-- Fix: Allow anonymous users to SELECT testimonials by review_token
-- This is needed for the public review submission page (/avaliar?token=xxx)

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can select with review token" ON public.testimonials;

-- Create policy to allow anonymous SELECT when filtering by review_token
CREATE POLICY "Public can select with review token"
  ON public.testimonials
  FOR SELECT
  USING (review_token IS NOT NULL);

-- Also need to allow anonymous UPDATE with review_token for submission
DROP POLICY IF EXISTS "Public can update with review token" ON public.testimonials;

CREATE POLICY "Public can update with review token"
  ON public.testimonials
  FOR UPDATE
  USING (review_token IS NOT NULL)
  WITH CHECK (review_token IS NOT NULL AND submitted_by = 'customer');

-- Comment
COMMENT ON POLICY "Public can select with review token" ON public.testimonials IS 
  'Allows anonymous users to verify review tokens exist (for /avaliar page)';
  
COMMENT ON POLICY "Public can update with review token" ON public.testimonials IS 
  'Allows anonymous users to submit testimonials via review link';
