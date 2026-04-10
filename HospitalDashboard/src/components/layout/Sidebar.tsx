import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BellRing,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { MOCK_ALERTS } from '../../utils/mockData';

const unacknowledged = MOCK_ALERTS.filter((a) => !a.acknowledged).length;

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

function NavItem({ to, icon, label, badge }: NavItemProps) {
  return (
    <NavLink
      to={to}
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

export default function Sidebar() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const coordinator = useAuthStore((s) => s.coordinator);
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Logo area */}
      <div className="px-4 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M14 2C9.58 2 6 5.58 6 10C6 15.5 14 26 14 26C14 26 22 15.5 22 10C22 5.58 18.42 2 14 2Z" fill="white" opacity="0.9"/>
              <rect x="11" y="7" width="6" height="1.8" rx="0.9" fill="#27500A"/>
              <rect x="12.1" y="6" width="3.8" height="6" rx="0.9" fill="#27500A"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-forest font-sans">Avyay Health</div>
            <div className="text-xs text-slate-400 font-sans">Coordinator Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        <NavItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <NavItem to="/alerts" icon={<BellRing size={18} />} label="Alerts" badge={unacknowledged} />
        <NavItem to="/reports" icon={<BarChart3 size={18} />} label="Reports" />
        <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" />
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="px-3 py-2 mb-1">
          <div className="text-sm font-medium text-slate-700 font-sans truncate">
            {coordinator?.display_name ?? 'Coordinator'}
          </div>
          <div className="text-xs text-slate-400 font-sans truncate">
            {coordinator?.hospital_name ?? ''}
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
