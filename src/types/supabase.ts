export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          telegram_id: number
          telegram_username: string | null
          full_name: string
          phone: string | null
          role: string
          is_active: boolean
          manufacturer_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          telegram_id: number
          telegram_username?: string | null
          full_name: string
          phone?: string | null
          role: string
          is_active?: boolean
          manufacturer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          telegram_id?: number
          telegram_username?: string | null
          full_name?: string
          phone?: string | null
          role?: string
          is_active?: boolean
          manufacturer_id?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          manufacturer_id: string
          name: string
          description: string | null
          category: string | null
          unit: string | null
          price: number
          min_order_qty: number
          stock_qty: number | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          manufacturer_id: string
          name: string
          description?: string | null
          category?: string | null
          unit?: string | null
          price: number
          min_order_qty?: number
          stock_qty?: number | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          manufacturer_id?: string
          name?: string
          description?: string | null
          category?: string | null
          unit?: string | null
          price?: number
          min_order_qty?: number
          stock_qty?: number | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          agent_id: string
          manufacturer_id: string
          status: string
          delivery_address: string | null
          delivery_lat: number | null
          delivery_lng: number | null
          customer_name: string | null
          customer_phone: string | null
          notes: string | null
          total_amount: number
          rejected_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          agent_id: string
          manufacturer_id: string
          status?: string
          delivery_address?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          customer_name?: string | null
          customer_phone?: string | null
          notes?: string | null
          total_amount?: number
          rejected_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          agent_id?: string
          manufacturer_id?: string
          status?: string
          delivery_address?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          customer_name?: string | null
          customer_phone?: string | null
          notes?: string | null
          total_amount?: number
          rejected_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          unit_price: number
          quantity: number
          subtotal: number
          item_notes: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          unit_price: number
          quantity: number
          subtotal?: number
          item_notes?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          unit_price?: number
          quantity?: number
          subtotal?: number
          item_notes?: string | null
        }
      }
    }
  }
}
