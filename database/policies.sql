-- Enable RLS on tables (best practice, ensures explicit policies)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products/Discounts: Public Read, Admin Write
-- (Assuming Admin has direct access or we allow all for now due to Anon Key usage)
-- Enabling FULL PUBLIC ACCESS for MVP simplicity as Admin uses Anon Key
CREATE POLICY "Allow Public Access Products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public Access Discounts" ON discounts FOR ALL USING (true) WITH CHECK (true);

-- Customers:
-- Allow Insert for everyone (for checkout)
-- Allow Select for everyone? (Admin needs it, but it exposes data if guessed? Risk accepted for MVP)
-- Allow Update? Yes, for upserting last_order_at
CREATE POLICY "Allow Public Access Customers" ON customers FOR ALL USING (true) WITH CHECK (true);

-- Orders:
-- Allow Insert for everyone
-- Allow Select for everyone (Admin needs it)
-- Allow Update for everyone (Admin updates status)
CREATE POLICY "Allow Public Access Orders" ON orders FOR ALL USING (true) WITH CHECK (true);
