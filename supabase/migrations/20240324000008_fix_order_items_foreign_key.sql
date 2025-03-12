-- Drop existing foreign key if it exists
ALTER TABLE IF EXISTS order_items
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Add the foreign key constraint
ALTER TABLE order_items
ADD CONSTRAINT order_items_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES products(id)
ON DELETE CASCADE;

-- Grant necessary permissions
GRANT REFERENCES ON products TO authenticated;
GRANT REFERENCES ON order_items TO authenticated; 