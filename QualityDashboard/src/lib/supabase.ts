import { createSupabaseClient } from '@shared/auth/createSupabaseClient';

export const { supabase, hasSupabase } = createSupabaseClient({
  persistSession: false,
});
