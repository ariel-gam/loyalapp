
-- Add logo_url and primary_color to store_settings
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#f97316'; -- Default orange-500
