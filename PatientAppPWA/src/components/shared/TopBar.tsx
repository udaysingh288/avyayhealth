import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  transparent?: boolean;
}

export default function TopBar({ title, showBack, right, transparent }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header
      className={`flex items-center justify-between px-5 py-4 shrink-0
        ${transparent ? 'bg-transparent' : 'bg-white border-b border-slate-100'}`}
      style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
    >
      <div className="w-10">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 -ml-1 rounded-full
              hover:bg-slate-100 active:bg-slate-200 transition
              focus:outline-none focus:ring-2 focus:ring-forest"
            aria-label="Go back"
          >
            <ArrowLeft size={22} className="text-slate-700" />
          </button>
        )}
      </div>

      {title && (
        <h1 className="font-sans font-semibold text-slate-800 text-base text-center flex-1 mx-2">
          {title}
        </h1>
      )}

      <div className="w-10 flex justify-end">
        {right}
      </div>
    </header>
  );
}
