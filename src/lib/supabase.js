
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Konfigurasi Supabase belum ditemukan.');
}

export const supabase = createClient(
  supabaseUrl.replace(/\/+$/, ''),
  supabaseAnonKey
);
