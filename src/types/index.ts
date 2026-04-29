export type UserRole = 'manufacturer' | 'agent';

export interface User {
  id: string;
  telegram_id: number;
  telegram_username?: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  manufacturer_id?: string;
  created_at: string;
}

export interface Product {
  id: string;
  manufacturer_id: string;
  name: string;
  description?: string;
  category: 'medicine' | 'drink' | 'food' | 'other';
  unit: string;
  price: number;
  min_order_qty: number;
  stock_qty?: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'rejected' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  agent_id: string;
  manufacturer_id: string;
  status: OrderStatus;
  delivery_address?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  total_amount: number;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
  agent?: User;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  item_notes?: string;
  product?: Product;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Notification {
  id: string;
  recipient_id: string;
  message: string;
  sent_at: string;
  status: 'sent' | 'read';
}

export interface Client {
  id: string;
  agent_id: string;
  name: string;
  phone: string;
  address: string;
  location_lat?: number;
  location_lng?: number;
  created_at: string;
}
