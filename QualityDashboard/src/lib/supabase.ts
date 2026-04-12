import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Persist auth session (coordinators expect to stay logged in across reloads)
// but keep an inactivity timeout enforced at the app level.
// HIPAA note: no PHI is cached on the client — only the auth JWT, which is
// a session token, not protected health information.
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storageKey: 'avyay-quality-auth',
        },
      })
    : null;

export const hasSupabase = !!supabase;
