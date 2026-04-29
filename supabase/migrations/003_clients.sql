-- CLIENTS
CREATE TABLE clients (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  phone           text,
  address         text,
  location_lat    numeric(10,7),
  location_lng    numeric(10,7),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY clients_access ON clients
  FOR ALL USING (agent_id = auth.uid());
