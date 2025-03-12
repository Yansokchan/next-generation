-- Create a function to increase product stock
CREATE OR REPLACE FUNCTION increase_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the product stock and status
  UPDATE products
  SET 
    stock = stock + p_quantity,
    status = CASE 
      WHEN stock + p_quantity > 0 THEN 'available'::text 
      ELSE status 
    END
  WHERE id = p_product_id;

  -- If no rows were updated, the product doesn't exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found with ID %', p_product_id;
  END IF;
END;
$$; 