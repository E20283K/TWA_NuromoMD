import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback to a dummy URL if missing to prevent createClient from crashing the app during initialization
const validUrl = supabaseUrl && supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder-project.supabase.co';
const validKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient<Database>(validUrl, validKey);
