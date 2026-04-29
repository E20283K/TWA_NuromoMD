-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE users (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id     bigint UNIQUE NOT NULL,
  telegram_username text,
  full_name       text NOT NULL,
  phone           text,
  role            text NOT NULL CHECK (role IN ('manufacturer', 'agent')),
  is_active       boolean DEFAULT true,
  manufacturer_id uuid REFERENCES users(id),
  created_at      timestamptz DEFAULT now()
);

-- PRODUCTS
CREATE TABLE products (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id uuid NOT NULL REFERENCES users(id),
  name            text NOT NULL,
  description     text,
  category        text,
  unit            text,
  price           numeric(12,2) NOT NULL,
  min_order_qty   integer DEFAULT 1,
  stock_qty       integer,
  image_url       text,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ORDERS
CREATE TABLE orders (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     text UNIQUE NOT NULL,
  agent_id         uuid NOT NULL REFERENCES users(id),
  manufacturer_id  uuid NOT NULL REFERENCES users(id),
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN (
                     'pending','confirmed','shipped',
                     'delivered','rejected','cancelled')),
  delivery_address text,
  delivery_lat     numeric(10,7),
  delivery_lng     numeric(10,7),
  customer_name    text,
  customer_phone   text,
  notes            text,
  total_amount     numeric(12,2) DEFAULT 0,
  rejected_reason  text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ORDER ITEMS
CREATE TABLE order_items (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   uuid REFERENCES products(id),
  product_name text NOT NULL,
  unit_price   numeric(12,2) NOT NULL,
  quantity     integer NOT NULL CHECK (quantity > 0),
  subtotal     numeric(12,2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
  item_notes   text
);

-- NOTIFICATIONS LOG
CREATE TABLE notifications (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id uuid NOT NULL REFERENCES users(id),
  order_id     uuid REFERENCES orders(id),
  message      text,
  sent_at      timestamptz DEFAULT now(),
  status       text DEFAULT 'sent'
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate order number
CREATE SEQUENCE order_seq START WITH 1;
CREATE OR REPLACE FUNCTION gen_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'ORD-' || LPAD(nextval('order_seq')::text, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_order
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION gen_order_number();

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users: everyone can see themselves
CREATE POLICY user_read_own ON users
  FOR SELECT USING (id = auth.uid());

-- Products: active products visible to agents of same manufacturer, all visible to manufacturer
CREATE POLICY products_read ON products
  FOR SELECT USING (
    is_active = true OR manufacturer_id = auth.uid()
  );

-- Orders: agents see only their own, manufacturers see all their own
CREATE POLICY orders_access ON orders
  FOR ALL USING (
    agent_id = auth.uid() OR manufacturer_id = auth.uid()
  );

CREATE POLICY order_items_access ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.agent_id = auth.uid() OR orders.manufacturer_id = auth.uid())
    )
  );
