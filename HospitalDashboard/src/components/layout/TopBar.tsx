import { RefreshCw } from 'lucide-react';

interface TopBarProps {
  title: string;
  lastUpdated?: string;
  onRefresh?: () => void;
}

export default function TopBar({ title, lastUpdated, onRefresh }: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-base font-semibold text-slate-800 font-sans">{title}</h1>
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs text-slate-400 font-sans">
            Updated {lastUpdated}
          </span>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700
              px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-forest"
            aria-label="Refresh data"
          >
            <RefreshCw size={13} aria-hidden="true" />
            Refresh
          </button>
        )}
      </div>
    </header>
  );
}
