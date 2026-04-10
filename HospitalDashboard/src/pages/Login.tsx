import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Coordinator } from '../types';

const DEMO_CREDENTIALS = {
  email: 'sarah.chen@riversidemed.org',
  password: 'demo1234',
};

const DEMO_COORDINATOR: Coordinator = {
  id: 'c-001',
  display_name: 'Sarah Chen',
  email: 'sarah.chen@riversidemed.org',
  hospital_id: 'h-001',
  hospital_name: 'Riverside Community Medical Center',
  role: 'coordinator',
};

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    if (
      email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password
    ) {
      setAuth('demo-jwt-token', DEMO_COORDINATOR);
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Use the demo credentials below.');
    }
    setLoading(false);
  }

  function fillDemo() {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError('');
  }

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-forest rounded-xl mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M14 2C9.58 2 6 5.58 6 10C6 15.5 14 26 14 26C14 26 22 15.5 22 10C22 5.58 18.42 2 14 2Z" fill="white" opacity="0.9"/>
              <rect x="11" y="7" width="6" height="1.8" rx="0.9" fill="#27500A"/>
              <rect x="12.1" y="6" width="3.8" height="6" rx="0.9" fill="#27500A"/>
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
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-sans text-slate-800 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest transition"
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
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-sans text-slate-800 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest transition"
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
              disabled={loading}
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

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2 font-sans">Demo credentials:</p>
            <button
              type="button"
              onClick={fillDemo}
              className="w-full text-left bg-slate-50 rounded-lg px-3.5 py-3 text-xs font-mono text-slate-600
                hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-forest transition border border-slate-200"
            >
              <div><span className="text-slate-400">Email: </span>{DEMO_CREDENTIALS.email}</div>
              <div className="mt-0.5"><span className="text-slate-400">Password: </span>{DEMO_CREDENTIALS.password}</div>
            </button>
          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-slate-400 mt-5 font-sans">
          Sessions expire after 15 minutes of inactivity.
        </p>
      </div>
    </div>
  );
}
