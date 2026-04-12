/**
 * Shared auth session hook for coordinator-facing dashboards.
 *
 * Mounts once at App root. Restores session from Supabase Auth,
 * fetches the coordinator's profile, and subscribes to auth changes.
 */

import { useEffect, useRef } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useAuthStore, type Profile } from './authStore';

export function useAuthSession(
  supabase: SupabaseClient | null,
  hasSupabase: boolean,
) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setLoading = useAuthStore((s) => s.setLoading);
  const initialized = useRef(false);

  useEffect(() => {
    if (!hasSupabase || !supabase) {
      setLoading(false);
      return;
    }

    // Prevent double initialization in React StrictMode
    if (initialized.current) return;
    initialized.current = true;

    async function loadProfile(userId: string): Promise<Profile | null> {
      try {
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
      } catch (err) {
        console.warn('[auth] profile load exception', err);
        return null;
      }
    }

    // Hydrate from existing session (e.g. persisted in localStorage)
    supabase.auth.getSession().then(({ data }) => {
      // Don't overwrite if Login already set auth
      if (useAuthStore.getState().userId) return;

      if (data.session?.user) {
        loadProfile(data.session.user.id).then((profile) => {
          // Check again — Login could have set it while we were loading profile
          if (useAuthStore.getState().userId) return;
          setAuth({
            userId: data.session!.user.id,
            email: data.session!.user.email ?? '',
            profile,
          });
        });
      } else {
        clearAuth();
      }
    }).catch((err) => {
      console.error('[auth] hydrate failed', err);
      clearAuth();
    });

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // If auth was already set for this user, skip (prevents Login/hook race)
        const current = useAuthStore.getState();
        if (current.userId && session?.user?.id === current.userId) {
          return;
        }

        if (event === 'SIGNED_OUT' || !session?.user) {
          clearAuth();
          return;
        }

        // New sign-in or user changed
        const profile = await loadProfile(session.user.id);
        // Re-check: Login page may have set auth while we loaded profile
        const latest = useAuthStore.getState();
        if (latest.userId === session.user.id) return;

        setAuth({
          userId: session.user.id,
          email: session.user.email ?? '',
          profile,
        });
      },
    );

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [supabase, hasSupabase, setAuth, clearAuth, setLoading]);
}
