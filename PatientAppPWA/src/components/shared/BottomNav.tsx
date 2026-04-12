import { useLocation, useNavigate } from 'react-router-dom';
import { usePatientStore } from '../../store/patientStore';
import { haptic } from '../../utils/haptics';

const TABS = [
  { to: '/', label: 'Home', icon: 'home', exact: true },
  { to: '/timeline', label: 'History', icon: 'calendar_month', exact: false },
  { to: '/care-plan', label: 'Care Plan', icon: 'checklist', exact: false },
  { to: '/care-team', label: 'Care Team', icon: 'stethoscope', exact: false },
] as const;

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = usePatientStore((s) => s.session);
  const storeCheckin = usePatientStore((s) => s.checkin);

  const hasPendingCheckin =
    !storeCheckin || storeCheckin.status === 'pending';

  // Hide on check-in flow and enrollment
  const hidden =
    location.pathname === '/checkin' || location.pathname.startsWith('/enroll');
  if (!session || hidden) return null;

  return (
    <nav
      className="shrink-0 relative z-30"
      aria-label="Main navigation"
      style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
    >
      {/* Glass blur background */}
      <div
        className="absolute inset-0 blur-nav"
        style={{ boxShadow: 'inset 0 0.5px 0 rgba(20,30,25,0.08)' }}
        aria-hidden="true"
      />

      <div className="relative flex px-3 pt-2 pb-1 max-w-md mx-auto">
        {TABS.map(({ to, label, icon, exact }) => {
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to);
          const isHome = to === '/';

          return (
            <button
              key={to}
              onClick={() => {
                if (!isActive) haptic('light');
                navigate(to);
              }}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className="group flex flex-1 flex-col items-center justify-end gap-1 pt-1 pb-0.5 focus:outline-none"
            >
              <div className="relative flex h-7 items-center justify-center">
                <span
                  className={`material-symbols-outlined transition-all duration-200 ease-ios
                    ${isActive ? 'text-primary scale-105' : 'text-sage-muted group-active:scale-95'}`}
                  style={{
                    fontVariationSettings: `'FILL' ${isActive ? 1 : 0}, 'wght' ${isActive ? 500 : 400}`,
                    fontSize: '26px',
                  }}
                >
                  {icon}
                </span>
                {isHome && hasPendingCheckin && !isActive && (
                  <span
                    className="absolute -top-0.5 right-0 translate-x-1/2 w-2.5 h-2.5 bg-status-red rounded-full ring-2 ring-[#FAF7F2]"
                    aria-label="Check-in pending"
                  />
                )}
              </div>
              <p
                className={`text-[11px] leading-none tracking-wide transition-colors
                  ${isActive ? 'font-semibold text-primary' : 'font-medium text-sage-muted'}`}
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
