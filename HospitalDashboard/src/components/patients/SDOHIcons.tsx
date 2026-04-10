import { Home, Apple, Car, Zap, Shield } from 'lucide-react';
import type { SDOHDomain } from '../../types';

const domainConfig: Record<SDOHDomain, { icon: React.ReactNode; label: string }> = {
  food_insecurity: {
    icon: <Apple size={13} />,
    label: 'Food insecurity',
  },
  housing_instability: {
    icon: <Home size={13} />,
    label: 'Housing instability',
  },
  transportation: {
    icon: <Car size={13} />,
    label: 'Transportation barrier',
  },
  utility_difficulty: {
    icon: <Zap size={13} />,
    label: 'Utility difficulty',
  },
  interpersonal_safety: {
    icon: <Shield size={13} />,
    label: 'Safety concern',
  },
};

interface SDOHIconsProps {
  flags: SDOHDomain[];
  compact?: boolean;
}

export default function SDOHIcons({ flags, compact = true }: SDOHIconsProps) {
  if (flags.length === 0) return <span className="text-slate-300 text-xs">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((domain) => {
        const { icon, label } = domainConfig[domain];
        return (
          <span
            key={domain}
            title={label}
            aria-label={label}
            className={`inline-flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5
              ${compact ? 'text-xs' : 'text-xs'}`}
          >
            {icon}
            {!compact && <span className="font-sans">{label}</span>}
          </span>
        );
      })}
    </div>
  );
}

export { domainConfig };
