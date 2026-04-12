/** Factory for creating a Supabase client with consistent auth config. */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function createSupabaseClient(opts?: {
  persistSession?: boolean;
}): { supabase: SupabaseClient | null; hasSupabase: boolean } {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !key) return { supabase: null, hasSupabase: false };

  const supabase = createClient(url, key, {
    auth: {
      persistSession: opts?.persistSession ?? false,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return { supabase, hasSupabase: true };
}
