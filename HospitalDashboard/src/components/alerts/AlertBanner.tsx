import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AlertBannerProps {
  count: number;
}

export default function AlertBanner({ count }: AlertBannerProps) {
  const navigate = useNavigate();
  if (count === 0) return null;

  return (
    <div
      className="bg-red-600 text-white px-6 py-3 flex items-center justify-between"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2.5">
        <AlertTriangle size={16} aria-hidden="true" className="shrink-0" />
        <span className="text-sm font-sans font-medium">
          {count} patient{count !== 1 ? 's' : ''} need{count === 1 ? 's' : ''} immediate attention
        </span>
      </div>
      <button
        onClick={() => navigate('/alerts')}
        className="text-sm font-sans font-semibold bg-white text-red-600 px-3 py-1 rounded-md
          hover:bg-red-50 transition focus:outline-none focus:ring-2 focus:ring-white"
      >
        Review Alerts
      </button>
    </div>
  );
}
