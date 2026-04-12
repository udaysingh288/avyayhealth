import { useEffect } from 'react';
import { supabase, hasSupabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

/**
 * Mounts once at App root. Restores session from Supabase Auth,
 * fetches the coordinator's profile, and subscribes to auth changes.
 */
export function useAuthSession() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    if (!hasSupabase || !supabase) {
      setLoading(false);
      return;
    }

    async function loadProfile(userId: string, email: string) {
      const { data } = await supabase!
        .from('profiles')
        .select('id, hospital_id, role, display_name')
        .eq('id', userId)
        .maybeSingle();
      setAuth(userId, email, data ?? null);
    }

    // Restore existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id, session.user.email ?? '');
      } else {
        clearAuth();
      }
    });

    // Subscribe to future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          loadProfile(session.user.id, session.user.email ?? '');
        } else {
          clearAuth();
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [setAuth, clearAuth, setLoading]);
}
