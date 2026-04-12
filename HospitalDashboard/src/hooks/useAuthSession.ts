/** Re-export shared auth session hook, pre-bound to this app's Supabase client. */

import { supabase, hasSupabase } from '../lib/supabase';
import { useAuthSession as useSharedAuthSession } from '@shared/auth/useAuthSession';

export function useAuthSession() {
  useSharedAuthSession(supabase, hasSupabase);
}
