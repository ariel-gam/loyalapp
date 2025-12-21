
-- 1. Fix Foreign Key on Orders to allow deleting Customers
-- When a customer is deleted, their orders will remain but disconnected (customer_id becomes NULL)
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;

ALTER TABLE orders
ADD CONSTRAINT orders_customer_id_fkey
FOREIGN KEY (customer_id)
REFERENCES customers(id)
ON DELETE SET NULL;

-- 2. Ensure Permissions are fully open for DELETE
-- (Re-applying to be 100% sure)
DROP POLICY IF EXISTS "Allow Public Access Orders" ON orders;
CREATE POLICY "Allow Public Access Orders" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Public Access Customers" ON customers;
CREATE POLICY "Allow Public Access Customers" ON customers FOR ALL USING (true) WITH CHECK (true);
