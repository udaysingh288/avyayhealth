import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { hasSupabase } from '../../lib/supabase';
import { useInactivityTimer } from '../../hooks/useInactivityTimer';
import SessionWarningModal from './SessionWarningModal';

export default function AuthGuard() {
  const userId = useAuthStore((s) => s.userId);
  const loading = useAuthStore((s) => s.loading);
  const location = useLocation();
  const { showWarning, extendSession } = useInactivityTimer();

  // Dev fallback — no Supabase means no gating
  if (!hasSupabase) {
    return (
      <>
        <Outlet />
        {showWarning && <SessionWarningModal onExtend={extendSession} />}
      </>
    );
  }

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

  return (
    <>
      <Outlet />
      {showWarning && <SessionWarningModal onExtend={extendSession} />}
    </>
  );
}
