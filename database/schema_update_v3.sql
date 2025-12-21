
-- Add is_archived column to orders for soft deletes
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
