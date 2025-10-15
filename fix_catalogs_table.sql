-- First, let's check the current structure of the catalogs table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'catalogs'
ORDER BY ordinal_position;

-- Check the existing constraints
SELECT
  con.conname as constraint_name,
  con.contype as constraint_type,
  pg_get_constraintdef(con.oid) as constraint_definition
FROM
  pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE
  rel.relname = 'catalogs'
  AND nsp.nspname = 'public';

-- Fix the catalogs table status constraint
DO $$
BEGIN
  -- Check if the constraint exists and drop it
  IF EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'catalogs_status_check'
  ) THEN
    ALTER TABLE public.catalogs DROP CONSTRAINT IF EXISTS catalogs_status_check;
  END IF;

  -- Add the correct constraint
  ALTER TABLE public.catalogs ADD CONSTRAINT catalogs_status_check 
    CHECK (status IN ('draft', 'public', 'unlisted'));
    
  -- Set a default value for status
  ALTER TABLE public.catalogs ALTER COLUMN status SET DEFAULT 'draft';
  
  -- Make sure the status column is NOT NULL
  ALTER TABLE public.catalogs ALTER COLUMN status SET NOT NULL;
  
  -- Check if any existing rows have invalid status values
  UPDATE public.catalogs SET status = 'draft' WHERE status NOT IN ('draft', 'public', 'unlisted');

END $$;
