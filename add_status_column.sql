ALTER TABLE employees ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive'));
