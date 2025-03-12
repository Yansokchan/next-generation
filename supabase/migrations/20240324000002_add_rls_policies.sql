-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policies for employees table
CREATE POLICY "Enable read access for authenticated users" ON employees
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON employees
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON employees
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON employees
FOR DELETE
TO authenticated
USING (true);

-- Repeat for other tables that need RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON customers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for authenticated users" ON customers FOR DELETE TO authenticated USING (true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for authenticated users" ON orders FOR DELETE TO authenticated USING (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for authenticated users" ON products FOR DELETE TO authenticated USING (true);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for authenticated users" ON order_items FOR DELETE TO authenticated USING (true); 