import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { hasSupabase } from '../../lib/supabase';

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Gate that forces the user to be signed in before rendering children.
 *
 * If Supabase isn't configured (no env vars), we transparently allow access
 * so developers can work against the built-in mockData. The Login page
 * surfaces a clear message in that state.
 */
export default function RequireAuth({ children }: RequireAuthProps) {
  const userId = useAuthStore((s) => s.userId);
  const loading = useAuthStore((s) => s.loading);
  const location = useLocation();

  // Dev fallback — no Supabase means no gating
  if (!hasSupabase) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-slate-500 font-sans text-sm">Loading…</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <Navigate to="/login" state={{ from: location.pathname }} replace />
    );
  }

  return <>{children}</>;
}
