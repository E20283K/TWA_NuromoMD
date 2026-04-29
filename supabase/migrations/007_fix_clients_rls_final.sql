-- Fix clients table RLS to work without Supabase Auth session
-- (Since we manage our own Auth via telegram_id in the users table)

DROP POLICY IF EXISTS clients_select ON clients;
DROP POLICY IF EXISTS clients_insert ON clients;
DROP POLICY IF EXISTS clients_update ON clients;
DROP POLICY IF EXISTS clients_delete ON clients;
DROP POLICY IF EXISTS clients_access ON clients;

-- Allow anyone to select (we filter by agent_id in the application logic anyway)
CREATE POLICY clients_select ON clients
  FOR SELECT USING (true);

-- Allow anyone to insert
CREATE POLICY clients_insert ON clients
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update
CREATE POLICY clients_update ON clients
  FOR UPDATE USING (true);

-- Allow anyone to delete
CREATE POLICY clients_delete ON clients
  FOR DELETE USING (true);
