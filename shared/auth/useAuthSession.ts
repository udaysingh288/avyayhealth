/**
 * Shared auth session hook for coordinator-facing dashboards.
 *
 * Mounts once at App root. Restores session from Supabase Auth,
 * fetches the coordinator's profile, and subscribes to auth changes.
 * Includes cancellation flag to prevent state updates after unmount.
 */

import { useEffect } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useAuthStore, type Profile } from './authStore';

export function useAuthSession(
  supabase: SupabaseClient | null,
  hasSupabase: boolean,
) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    if (!hasSupabase || !supabase) {
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
        // eslint-disable-next-line no-console
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
  }, [supabase, hasSupabase, setAuth, clearAuth, setLoading]);
}
