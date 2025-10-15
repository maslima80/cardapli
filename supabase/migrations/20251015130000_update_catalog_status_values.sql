-- Update catalog status constraint to use Portuguese values
-- Drop old constraint
ALTER TABLE catalogs DROP CONSTRAINT IF EXISTS catalogs_status_check;

-- Add new constraint with Portuguese values
ALTER TABLE catalogs ADD CONSTRAINT catalogs_status_check 
  CHECK (status IN ('rascunho', 'publicado', 'draft', 'public', 'unlisted'));

-- Migrate existing data to new values
UPDATE catalogs SET status = 'rascunho' WHERE status = 'draft';
UPDATE catalogs SET status = 'publicado' WHERE status IN ('public', 'unlisted');

-- After migration is complete, you can optionally remove old values from constraint
-- (but keeping them for now for backward compatibility)
