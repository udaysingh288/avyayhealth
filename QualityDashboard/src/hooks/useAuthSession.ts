import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore, type Profile } from '../store/authStore';

/**
 * Subscribe to Supabase Auth state and mirror it into the Zustand auth store.
 * Also loads the user's profile row (hospital_id + role) on sign-in so the
 * rest of the app can gate on role.
 *
 * Mounts once at the top of App.tsx.
 */
export function useAuthSession() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    if (!supabase) {
      // No Supabase configured — skip auth entirely
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile(userId: string): Promise<Profile | null> {
      const { data, error } = await supabase!
        .from('profiles')
        .select('id, hospital_id, role, display_name')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        console.warn('[auth] failed to load profile', error.message);
        return null;
      }
      return data as Profile | null;
    }

    async function hydrate() {
      const { data } = await supabase!.auth.getSession();
      if (cancelled) return;
      if (data.session?.user) {
        const profile = await loadProfile(data.session.user.id);
        if (cancelled) return;
        setAuth({
          userId: data.session.user.id,
          email: data.session.user.email ?? '',
          profile,
        });
      } else {
        clearAuth();
      }
    }

    hydrate();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await loadProfile(session.user.id);
          setAuth({
            userId: session.user.id,
            email: session.user.email ?? '',
            profile,
          });
        } else {
          clearAuth();
        }
      },
    );

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [setAuth, clearAuth, setLoading]);
}
