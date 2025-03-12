-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON employees;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON employees;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON employees;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON employees;

-- Enable RLS on employees table
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for employees table
CREATE POLICY "Enable read access for authenticated users"
ON employees FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON employees FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON employees FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
ON employees FOR DELETE
TO authenticated
USING (true);

-- Grant necessary permissions to authenticated users
GRANT ALL ON employees TO authenticated; 