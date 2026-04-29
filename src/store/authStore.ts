import { create } from 'zustand';
import type { User } from '../types';
import { supabase } from '../lib/supabase';
import { tg } from '../lib/telegram';

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  login: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const initData = tg.initData;
      if (!initData) {
        throw new Error('Telegram initData not found');
      }

      // In a real app, we would call an Edge Function to validate initData and get a Supabase JWT
      // For now, we'll try to find the user in the database or sign in if they exist
      // This is a simplification. The production way is using the Edge Function.
      
      const telegramId = tg.initDataUnsafe.user?.id;
      if (!telegramId) throw new Error('Could not get Telegram ID');

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      if (userData) {
        set({ user: userData as User, isLoading: false });
      } else {
        // Auto-register first user as manufacturer, others as agents for demo
        const { data: allUsers } = await supabase.from('users').select('id').limit(1);
        const role = (!allUsers || allUsers.length === 0) ? 'manufacturer' : 'agent';
        
        const { data: newUser, error: registerError } = await supabase
          .from('users')
          .insert({
            telegram_id: telegramId,
            telegram_username: tg.initDataUnsafe.user?.username || null,
            full_name: `${tg.initDataUnsafe.user?.first_name || ''} ${tg.initDataUnsafe.user?.last_name || ''}`.trim(),
            role,
          } as any)
          .select()
          .single();

        if (registerError) throw registerError;
        set({ user: newUser as User, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Login error:', error);
    }
  },
  logout: async () => {
    set({ user: null, session: null });
  }
}));
