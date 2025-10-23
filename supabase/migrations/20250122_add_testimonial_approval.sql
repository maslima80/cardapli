-- Add approval status and review token to testimonials table
ALTER TABLE public.testimonials
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS review_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS submitted_by TEXT CHECK (submitted_by IN ('owner', 'customer')),
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Create index for review tokens
CREATE INDEX IF NOT EXISTS idx_testimonials_review_token ON public.testimonials(review_token) WHERE review_token IS NOT NULL;

-- Create index for pending reviews
CREATE INDEX IF NOT EXISTS idx_testimonials_pending ON public.testimonials(user_id, status) WHERE status = 'pending';

-- Update RLS policies to allow public insert with review token
DROP POLICY IF EXISTS "Public can insert with review token" ON public.testimonials;
CREATE POLICY "Public can insert with review token"
  ON public.testimonials
  FOR INSERT
  WITH CHECK (review_token IS NOT NULL AND submitted_by = 'customer');

-- Update public view policy to only show approved testimonials
DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
CREATE POLICY "Public can view approved testimonials"
  ON public.testimonials
  FOR SELECT
  USING (status = 'approved');

-- Comment
COMMENT ON COLUMN public.testimonials.status IS 'Approval status: pending (awaiting approval), approved (visible), rejected (hidden)';
COMMENT ON COLUMN public.testimonials.review_token IS 'Unique token for customer review submission link';
COMMENT ON COLUMN public.testimonials.submitted_by IS 'Who submitted: owner (business owner) or customer (via review link)';
