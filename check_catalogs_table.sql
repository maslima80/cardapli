-- Check the structure of the catalogs table
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM 
  information_schema.columns
WHERE 
  table_name = 'catalogs'
ORDER BY 
  ordinal_position;

-- Check constraints on the catalogs table
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
