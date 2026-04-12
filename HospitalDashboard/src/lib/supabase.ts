import { createSupabaseClient } from '@shared/auth/createSupabaseClient';

export const { supabase, hasSupabase } = createSupabaseClient({
  // Auth JWTs are persisted so coordinators don't lose their session on refresh.
  // PHI is never stored client-side — only the auth token is persisted.
  // The 15-minute inactivity timer still enforces session expiry.
  persistSession: true,
});
