import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  AlertTriangle,
  Activity,
  LogOut,
  Menu,
  X,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    if (hasSupabase && supabase) {
      await supabase.auth.signOut();
    }
    setSidebarOpen(false);
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

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-off-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — overlay on mobile, fixed on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-forest text-white flex flex-col transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-serif font-bold text-lg">
                A
              </div>
              <div>
                <div className="font-serif text-[18px] leading-tight">Avyay Health</div>
                <div className="text-[11px] text-white/60 font-sans">Quality Dashboard</div>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeSidebar}
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

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar with hamburger */}
        <div className="lg:hidden h-12 bg-forest flex items-center px-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="ml-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center font-serif font-bold text-sm text-white">
              A
            </div>
            <span className="text-sm font-serif text-white">Avyay Health</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
