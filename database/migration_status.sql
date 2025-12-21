-- Add status column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' 
CHECK (status IN ('pending', 'paid', 'cancelled'));

-- Update existing orders to 'paid' (optional, assuming old ones were handled) or 'pending'
UPDATE orders SET status = 'paid' WHERE status IS NULL;
