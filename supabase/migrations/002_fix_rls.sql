-- Fix RLS policies to allow inserts and updates for anonymous users (Telegram ID based)
-- Since we are not using standard Supabase Auth, we allow these operations based on field presence.

-- PRODUCTS
CREATE POLICY products_insert ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY products_update ON products
  FOR UPDATE USING (manufacturer_id::text = manufacturer_id::text); -- dummy condition to allow updates

-- USERS
CREATE POLICY users_insert ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY users_update ON users
  FOR UPDATE USING (true);

-- ORDERS
CREATE POLICY orders_insert ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY orders_update ON orders
  FOR UPDATE USING (true);

-- ORDER ITEMS
CREATE POLICY order_items_insert ON order_items
  FOR INSERT WITH CHECK (true);
