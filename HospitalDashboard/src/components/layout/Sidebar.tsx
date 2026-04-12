import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BellRing,
  BarChart3,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase, hasSupabase } from '../../lib/supabase';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
}

function NavItem({ to, icon, label, badge, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-medium transition
        ${isActive
          ? 'bg-forest text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <span className="shrink-0 w-5 h-5 flex items-center justify-center" aria-hidden="true">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const email = useAuthStore((s) => s.email);

  async function handleLogout() {
    if (hasSupabase && supabase) {
      await supabase.auth.signOut();
    }
    onNavigate?.();
    navigate('/login', { replace: true });
  }

  const displayName = profile?.display_name ?? email ?? 'Coordinator';
  const roleLabel =
    profile?.role === 'care_coordinator'
      ? 'Care Coordinator'
      : profile?.role === 'quality_director'
        ? 'Quality Director'
        : profile?.role === 'admin'
          ? 'Admin'
          : 'Care Coordinator';

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen">
      {/* Logo area */}
      <div className="px-4 py-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M16 28 C16 28 3 19 3 10.5 C3 6.91 5.91 4 9.5 4 C11.74 4 13.73 5.14 16 7.3 C18.27 5.14 20.26 4 22.5 4 C26.09 4 29 6.91 29 10.5 C29 19 16 28 16 28 Z"
                  fill="white"
                />
                <rect x="14.6" y="9" width="2.8" height="9" rx="0.6" fill="#053027" />
                <rect x="11.5" y="12.1" width="9" height="2.8" rx="0.6" fill="#053027" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-forest font-sans">Avyay Health</div>
              <div className="text-xs text-slate-400 font-sans">Coordinator Portal</div>
            </div>
          </div>
          {/* Close button — visible on mobile only */}
          <button
            onClick={onNavigate}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        <NavItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={onNavigate} />
        <NavItem to="/alerts" icon={<BellRing size={18} />} label="Alerts" onClick={onNavigate} />
        <NavItem to="/reports" icon={<BarChart3 size={18} />} label="Reports" onClick={onNavigate} />
        <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" onClick={onNavigate} />
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="px-3 py-2 mb-1">
          <div className="text-sm font-medium text-slate-700 font-sans truncate">
            {displayName}
          </div>
          <div className="text-xs text-slate-400 font-sans truncate">
            {roleLabel}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-sans font-medium
            text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition
            focus:outline-none focus:ring-2 focus:ring-forest"
        >
          <LogOut size={18} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
