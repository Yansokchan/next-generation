-- Add details column to order_items table
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT NULL;

-- Grant necessary permissions
GRANT ALL ON order_items TO authenticated; 