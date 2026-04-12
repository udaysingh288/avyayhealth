import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  AlertTriangle,
  Activity,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase, hasSupabase } from '../../lib/supabase';

const NAV = [
  { to: '/', label: 'Overview', Icon: LayoutDashboard, end: true },
  { to: '/coordinators', label: 'Coordinators', Icon: Users, end: false },
  { to: '/engagement', label: 'Engagement', Icon: Activity, end: false },
  { to: '/reimbursement', label: 'Reimbursement', Icon: DollarSign, end: false },
  { to: '/penalties', label: 'HRRP Risk', Icon: AlertTriangle, end: false },
] as const;

export default function Layout() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const email = useAuthStore((s) => s.email);

  async function handleSignOut() {
    if (hasSupabase && supabase) {
      await supabase.auth.signOut();
    }
    navigate('/login', { replace: true });
  }

  const displayName =
    profile?.display_name ?? email ?? 'Maya Rodriguez';
  const roleLabel =
    profile?.role === 'quality_director'
      ? 'VP of Quality'
      : profile?.role === 'care_coordinator'
        ? 'Care Coordinator'
        : profile?.role === 'admin'
          ? 'Admin'
          : 'VP of Quality';

  return (
    <div className="flex h-screen bg-off-white">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-forest text-white flex flex-col">
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-serif font-bold text-lg">
              A
            </div>
            <div>
              <div className="font-serif text-[18px] leading-tight">Avyay Health</div>
              <div className="text-[11px] text-white/60 font-sans">Quality Dashboard</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium font-sans transition
                 ${
                   isActive
                     ? 'bg-white/10 text-white'
                     : 'text-white/70 hover:bg-white/5 hover:text-white'
                 }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 rounded-md">
            <div className="text-[13px] font-semibold truncate">
              {displayName}
            </div>
            <div className="text-[11px] text-white/60">{roleLabel}</div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] text-white/60 hover:text-white hover:bg-white/5"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
