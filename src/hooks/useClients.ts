import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Client } from '../types';

export const useClients = (agentId?: string) => {
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ['clients', agentId],
    queryFn: async () => {
      if (!agentId) return [];

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useClients] fetch error:', error);
        throw new Error(error.message);
      }
      return data as Client[];
    },
    enabled: !!agentId,
    retry: false,
  });

  const addClientMutation = useMutation({
    mutationFn: async (client: Omit<Client, 'id' | 'created_at'>) => {
      console.log('[useClients] inserting client:', client);

      const { data, error } = await supabase
        .from('clients')
        .insert(client as any)
        .select()
        .single();

      if (error) {
        console.error('[useClients] insert error:', error);
        throw new Error(error.message);
      }

      console.log('[useClients] inserted:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: Error) => {
      console.error('[useClients] mutation error:', error.message);
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('[useClients] delete error:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return {
    clients: clientsQuery.data || [],
    isLoading: clientsQuery.isLoading,
    fetchError: clientsQuery.error as Error | null,
    addClient: addClientMutation.mutateAsync,
    deleteClient: deleteClientMutation.mutateAsync,
    isMutating: addClientMutation.isPending,
  };
};
