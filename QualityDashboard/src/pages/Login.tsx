import { useState, useEffect, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase, hasSupabase } from '../lib/supabase';
import { useAuthStore, type Profile } from '../store/authStore';

export default function Login() {
  const userId = useAuthStore((s) => s.userId);
  const authLoading = useAuthStore((s) => s.loading);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safety: if authLoading is stuck for more than 3 seconds, clear it
  useEffect(() => {
    if (!authLoading) return;
    const t = setTimeout(() => {
      if (useAuthStore.getState().loading) {
        clearAuth();
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [authLoading, clearAuth]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-slate-500 font-sans text-sm">Loading…</div>
      </div>
    );
  }

  if (userId) {
    const from =
      (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasSupabase || !supabase) {
      setError(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env and restart.',
      );
      return;
    }

    setSubmitting(true);
    try {
      const signInPromise = supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Sign-in timed out. Please try again.')), 15000),
      );

      const { data, error: signInErr } = await Promise.race([signInPromise, timeoutPromise]);

      if (signInErr) {
        setError(signInErr.message);
        setSubmitting(false);
        return;
      }

      if (!data.session?.user) {
        setError('Sign-in succeeded but no session was returned.');
        setSubmitting(false);
        return;
      }

      // Load profile — don't block on failure
      let profile: Profile | null = null;
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, hospital_id, role, display_name')
          .eq('id', data.session.user.id)
          .maybeSingle();
        profile = profileData as Profile | null;
      } catch {
        // Profile load failed — continue with null profile
      }

      // Set auth state directly — triggers redirect via userId check
      useAuthStore.getState().setAuth({
        userId: data.session.user.id,
        email: data.session.user.email ?? '',
        profile,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-lg bg-forest text-white flex items-center justify-center font-serif font-bold text-xl">
              A
            </div>
            <div className="text-left">
              <div className="font-serif text-[22px] text-forest leading-tight">
                Avyay Health
              </div>
              <div className="text-[11px] text-slate-500 font-sans">
                Quality Dashboard
              </div>
            </div>
          </div>
          <h1 className="font-serif text-[28px] text-forest">
            Sign in to your hospital
          </h1>
          <p className="text-[13px] text-slate-500 font-sans mt-1.5">
            Quality directors and care team leadership
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-[12px] font-semibold text-slate-700 font-sans mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-[14px] font-sans text-slate-800 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15 disabled:opacity-60"
              placeholder="you@hospital.example"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[12px] font-semibold text-slate-700 font-sans mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-[14px] font-sans text-slate-800 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15 disabled:opacity-60"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="text-[12px] text-danger bg-danger/5 border border-danger/15 rounded-md px-3 py-2 font-sans"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !email || !password}
            className="w-full bg-forest text-white rounded-lg py-2.5 text-[14px] font-semibold font-sans hover:bg-forest-light transition disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-[11px] text-slate-500 font-sans text-center pt-2">
            Contact your Avyay Health account manager if you need access.
          </p>
        </form>
      </div>
    </div>
  );
}
