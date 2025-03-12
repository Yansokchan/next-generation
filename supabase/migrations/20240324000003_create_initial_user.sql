-- Create initial admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS but allow all authenticated users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access" ON auth.users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true); 