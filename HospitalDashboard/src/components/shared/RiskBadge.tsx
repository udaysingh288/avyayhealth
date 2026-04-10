import type { RiskLevel } from '../../types';

interface RiskBadgeProps {
  risk: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

const configs: Record<RiskLevel, { label: string; className: string; dot: string }> = {
  red: {
    label: 'RED',
    className: 'bg-red-100 text-red-700 border border-red-200',
    dot: 'bg-red-500',
  },
  yellow: {
    label: 'YELLOW',
    className: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    dot: 'bg-yellow-500',
  },
  green: {
    label: 'GREEN',
    className: 'bg-green-50 text-green-700 border border-green-200',
    dot: 'bg-green-500',
  },
  not_started: {
    label: 'NOT STARTED',
    className: 'bg-slate-100 text-slate-500 border border-slate-200',
    dot: 'bg-slate-400',
  },
};

const sizeClass: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3.5 py-1.5 font-semibold',
};

export default function RiskBadge({ risk, size = 'md', showDot = true }: RiskBadgeProps) {
  const { label, className, dot } = configs[risk];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-sans font-medium tracking-wide ${className} ${sizeClass[size]}`}
      role="status"
      aria-label={`Risk level: ${label}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} aria-hidden="true" />
      )}
      {label}
    </span>
  );
}
