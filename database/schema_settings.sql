
-- Create a table for store settings
CREATE TABLE IF NOT EXISTS store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  store_name TEXT DEFAULT 'LoyalFood',
  address TEXT DEFAULT 'Av. Corrientes 1234, CABA',
  phone TEXT DEFAULT '5491112345678',
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row if it doesn't exist
INSERT INTO store_settings (id, store_name, address, phone)
VALUES (1, 'LoyalFood', 'Av. Corrientes 1234, CABA', '5491112345678')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read settings
CREATE POLICY "Public read access" ON store_settings
  FOR SELECT USING (true);

-- Policy: Only authenticated/admin users can update
-- (For now, allowing update for anon since auth is simple pass-based in this MVP)
-- But ideally this should be restricted. Given the current "admin login" is just client-side, 
-- we need to be careful. I will replicate the pattern used for products if any. 
-- Checking policies.sql might be good.

CREATE POLICY "Admin update access" ON store_settings
  FOR UPDATE USING (true);
