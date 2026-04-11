import { useLocation, useNavigate } from 'react-router-dom';
import { usePatientStore } from '../../store/patientStore';
import { MOCK_CHECKIN_PENDING } from '../../utils/mockData';

const TABS = [
  { to: '/', label: 'Home', icon: 'home', iconFill: 'home', exact: true },
  { to: '/timeline', label: 'History', icon: 'check_circle', iconFill: 'check_circle', exact: false },
  { to: '/care-plan', label: 'Care Plan', icon: 'assignment', iconFill: 'assignment', exact: false },
  { to: '/care-team', label: 'Care Team', icon: 'medical_services', iconFill: 'medical_services', exact: false },
] as const;

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = usePatientStore((s) => s.session);

  const hasPendingCheckin = MOCK_CHECKIN_PENDING.status === 'pending';

  // Hide on check-in flow and enrollment
  const hidden = location.pathname === '/checkin' || location.pathname.startsWith('/enroll');
  if (!session || hidden) return null;

  return (
    <nav
      className="shrink-0 bg-warm-oatmeal border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      aria-label="Main navigation"
    >
      <div className="flex gap-2 px-4 pt-3 pb-6 max-w-md mx-auto">
        {TABS.map(({ to, label, icon, iconFill, exact }) => {
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to);
          const isHome = to === '/';

          return (
            <button
              key={to}
              onClick={() => navigate(to)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center justify-end gap-1 transition-colors
                ${isActive ? 'text-primary' : 'text-sage-muted hover:text-forest-slate'}`}
            >
              <div className="flex h-8 items-center justify-center relative">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
                >
                  {isActive ? iconFill : icon}
                </span>
                {isHome && hasPendingCheckin && !isActive && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-status-red rounded-full border-2 border-warm-oatmeal"
                    aria-label="Check-in pending"
                  />
                )}
              </div>
              <p
                className={`text-xs leading-normal tracking-wide
                  ${isActive ? 'font-bold' : 'font-medium'}`}
              >
                {label}
              </p>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
