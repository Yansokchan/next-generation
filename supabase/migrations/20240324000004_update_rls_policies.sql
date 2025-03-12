-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON employees;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON employees;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON employees;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON employees;

-- Enable RLS on employees table
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for employees table with unique names
CREATE POLICY "employees_read_policy_v2"
ON employees FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "employees_insert_policy_v2"
ON employees FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "employees_update_policy_v2"
ON employees FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "employees_delete_policy_v2"
ON employees FOR DELETE
TO authenticated
USING (true);

-- Grant necessary permissions to authenticated users
GRANT ALL ON employees TO authenticated; 