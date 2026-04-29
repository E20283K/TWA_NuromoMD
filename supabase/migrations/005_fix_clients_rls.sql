-- Fix clients table RLS to allow inserts (same pattern as other tables)
-- The existing policy "clients_access" uses auth.uid() which may block inserts
-- if the JWT doesn't resolve properly. Add explicit INSERT policy.

-- Drop the overly restrictive ALL policy and replace with explicit ones
DROP POLICY IF EXISTS clients_access ON clients;

CREATE POLICY clients_select ON clients
  FOR SELECT USING (agent_id = auth.uid());

CREATE POLICY clients_insert ON clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY clients_update ON clients
  FOR UPDATE USING (agent_id = auth.uid());

CREATE POLICY clients_delete ON clients
  FOR DELETE USING (agent_id = auth.uid());
