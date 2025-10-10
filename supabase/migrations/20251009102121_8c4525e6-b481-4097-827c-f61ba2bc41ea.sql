-- Make price column nullable to allow products without price
ALTER TABLE products ALTER COLUMN price DROP NOT NULL;