-- Update the status check constraint to ensure 'pending_payment' is included
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'pending_payment', 'processing', 'on-hold', 'shipped', 'delivered', 'cancelled'));

-- Update the payment_method check constraint to include 'payfast' and remove 'yoco'
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('bank', 'cash', 'paypal', 'payfast'));
