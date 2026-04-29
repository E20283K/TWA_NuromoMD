import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';

export const useProducts = (manufacturerId?: string) => {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products', manufacturerId],
    queryFn: async () => {
      let query = supabase.from('products').select('*').eq('is_active', true);
      
      if (manufacturerId) {
        query = query.eq('manufacturer_id', manufacturerId);
      }

      const { data, error } = await query.order('name');
      if (error) throw error;
      return data as Product[];
    },
    enabled: true,
  });

  const addProductMutation = useMutation({
    mutationFn: async (newProduct: Partial<Product>) => {
      const { data, error } = await (supabase.from('products') as any)
        .insert(newProduct)
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await (supabase.from('products') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    addProduct: addProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
  };
};
