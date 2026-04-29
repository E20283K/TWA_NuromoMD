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
      
      const initData = tg.initData || (window as any).Telegram?.WebApp?.initData;
      if (!initData) {
        throw new Error('Telegram initData not found. Please open this app in Telegram.');
      }

      const initDataUnsafe = tg.initDataUnsafe || (window as any).Telegram?.WebApp?.initDataUnsafe;
      const telegramId = initDataUnsafe?.user?.id;
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
            telegram_username: initDataUnsafe?.user?.username || null,
            full_name: `${initDataUnsafe?.user?.first_name || ''} ${initDataUnsafe?.user?.last_name || ''}`.trim(),
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
