-- Fix the catalogs table status constraint
ALTER TABLE public.catalogs DROP CONSTRAINT IF EXISTS catalogs_status_check;

-- Add the correct constraint
ALTER TABLE public.catalogs ADD CONSTRAINT catalogs_status_check 
  CHECK (status IN ('draft', 'public', 'unlisted'));
  
-- Set a default value for status
ALTER TABLE public.catalogs ALTER COLUMN status SET DEFAULT 'draft';

-- Make sure the status column is NOT NULL
ALTER TABLE public.catalogs ALTER COLUMN status SET NOT NULL;

-- Check if any existing rows have invalid status values
UPDATE public.catalogs SET status = 'draft' WHERE status NOT IN ('draft', 'public', 'unlisted');
