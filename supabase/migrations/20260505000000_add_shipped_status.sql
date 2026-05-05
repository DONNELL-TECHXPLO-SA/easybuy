-- Update the status check constraint to include 'shipped'
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'processing', 'on-hold', 'shipped', 'delivered', 'cancelled'));
