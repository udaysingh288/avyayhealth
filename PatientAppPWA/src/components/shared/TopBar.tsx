import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { haptic } from '../../utils/haptics';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  transparent?: boolean;
}

export default function TopBar({
  title,
  subtitle,
  showBack,
  right,
  transparent,
}: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header
      className={`shrink-0 sticky top-0 z-20 ${
        transparent ? 'bg-transparent' : 'blur-nav hairline-b'
      }`}
      style={{ paddingTop: 'max(14px, env(safe-area-inset-top))' }}
    >
      <div className="flex items-center justify-between px-4 pb-3 min-h-[44px]">
        <div className="w-11 flex items-center">
          {showBack && (
            <button
              onClick={() => {
                haptic('light');
                navigate(-1);
              }}
              className="flex items-center justify-center w-11 h-11 -ml-2 rounded-full
                active:bg-black/5 transition tap-scale
                focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label="Go back"
            >
              <ArrowLeft size={22} className="text-forest-slate" strokeWidth={2.4} />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center text-center px-2">
          {title && (
            <h1 className="font-sans font-bold text-[17px] text-forest-slate leading-tight tracking-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-[12px] text-sage-muted font-medium mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="w-11 flex items-center justify-end">{right}</div>
      </div>
    </header>
  );
}
