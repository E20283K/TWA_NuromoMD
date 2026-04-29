import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Order, OrderItem, OrderStatus } from '../types';
import { useEffect } from 'react';

export const useOrders = (role: 'manufacturer' | 'agent', userId?: string) => {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['orders', role, userId],
    queryFn: async () => {
      if (!userId) return [];
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          agent:users!orders_agent_id_fkey(*),
          items:order_items(*)
        `);

      if (role === 'agent') {
        query = query.eq('agent_id', userId);
      } else {
        query = query.eq('manufacturer_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!userId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: role === 'agent' ? `agent_id=eq.${userId}` : `manufacturer_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, role, queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, rejectedReason }: { orderId: string, status: OrderStatus, rejectedReason?: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, rejected_reason: rejectedReason, updated_at: new Date().toISOString() } as any)
        .eq('id', orderId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async ({ order, items }: { order: Partial<Order>, items: Partial<OrderItem>[] }) => {
      // 1. Create order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert(order as any)
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const itemsWithOrderId = items.map(item => ({
        ...item,
        order_id: newOrder.id
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId as any);

      if (itemsError) throw itemsError;

      return newOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    updateStatus: updateStatusMutation.mutateAsync,
    createOrder: createOrderMutation.mutateAsync,
  };
};
