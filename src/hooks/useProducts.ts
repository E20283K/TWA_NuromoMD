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
      console.log('Inserting product:', newProduct);
      const { data, error } = await (supabase.from('products') as any)
        .insert(newProduct)
        .select()
        .single();
      
      if (error) {
        console.error('Insert product error:', error);
        throw error;
      }
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      console.log('Updating product:', id, updates);
      const { data, error } = await (supabase.from('products') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Update product error:', error);
        throw error;
      }
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('products') as any)
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
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
    deleteProduct: deleteProductMutation.mutateAsync,
  };
};
