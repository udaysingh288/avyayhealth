import { useState, FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase, hasSupabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const userId = useAuthStore((s) => s.userId);
  const authLoading = useAuthStore((s) => s.loading);
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-slate-500 font-sans text-sm">Loading…</div>
      </div>
    );
  }

  if (userId) {
    const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!hasSupabase || !supabase) {
      setError(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env and restart.',
      );
      return;
    }

    setLoading(true);
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInErr) {
        setError(signInErr.message);
        return;
      }
      // onAuthStateChange in useAuthSession will update the store
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-forest rounded-xl mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M16 28 C16 28 3 19 3 10.5 C3 6.91 5.91 4 9.5 4 C11.74 4 13.73 5.14 16 7.3 C18.27 5.14 20.26 4 22.5 4 C26.09 4 29 6.91 29 10.5 C29 19 16 28 16 28 Z"
                fill="white"
              />
              <rect x="14.6" y="9" width="2.8" height="9" rx="0.6" fill="#053027" />
              <rect x="11.5" y="12.1" width="9" height="2.8" rx="0.6" fill="#053027" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-forest mb-1">Avyay Health</h1>
          <p className="text-sm text-slate-500 font-sans">Care Coordinator Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="font-sans font-semibold text-slate-800 text-lg mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-sans text-slate-800 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest transition disabled:opacity-60"
                  placeholder="you@hospital.org"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-sans text-slate-800 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest transition disabled:opacity-60"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="mt-6 w-full bg-forest text-white font-sans font-medium text-sm px-4 py-2.5 rounded-lg
                hover:bg-forest-light focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-xs text-slate-500 font-sans text-center mt-5">
            Contact your Avyay Health account manager if you need access.
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5 font-sans">
          Sessions expire after 15 minutes of inactivity.
        </p>
      </div>
    </div>
  );
}
