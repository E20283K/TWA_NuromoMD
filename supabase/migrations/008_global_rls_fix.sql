-- GLOBAL RLS FIX for Telegram Mini App
-- Since we do not use Supabase Auth sessions, auth.uid() is always NULL.
-- We must allow access based on other criteria or simply allow public access
-- for this demo/prototype, relying on the application logic for filtering.

-- USERS
DROP POLICY IF EXISTS user_read_own ON users;
DROP POLICY IF EXISTS users_insert ON users;
DROP POLICY IF EXISTS users_update ON users;
CREATE POLICY users_access_all ON users FOR ALL USING (true);

-- PRODUCTS
DROP POLICY IF EXISTS products_read ON products;
DROP POLICY IF EXISTS products_insert ON products;
DROP POLICY IF EXISTS products_update ON products;
CREATE POLICY products_access_all ON products FOR ALL USING (true);

-- ORDERS
DROP POLICY IF EXISTS orders_access ON orders;
DROP POLICY IF EXISTS orders_insert ON orders;
DROP POLICY IF EXISTS orders_update ON orders;
CREATE POLICY orders_access_all ON orders FOR ALL USING (true);

-- ORDER ITEMS
DROP POLICY IF EXISTS order_items_access ON order_items;
DROP POLICY IF EXISTS order_items_insert ON order_items;
CREATE POLICY order_items_access_all ON order_items FOR ALL USING (true);

-- CLIENTS
DROP POLICY IF EXISTS clients_access ON clients;
DROP POLICY IF EXISTS clients_select ON clients;
DROP POLICY IF EXISTS clients_insert ON clients;
DROP POLICY IF EXISTS clients_update ON clients;
DROP POLICY IF EXISTS clients_delete ON clients;
CREATE POLICY clients_access_all ON clients FOR ALL USING (true);
