interface MetricCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  variant?: 'default' | 'red' | 'yellow' | 'green' | 'blue';
  active?: boolean;
  onClick?: () => void;
}

const variantStyles: Record<string, string> = {
  default: 'bg-white border-slate-200 hover:border-slate-300',
  red: 'bg-red-50 border-red-200 hover:border-red-300',
  yellow: 'bg-yellow-50 border-yellow-200 hover:border-yellow-300',
  green: 'bg-green-50 border-green-200 hover:border-green-300',
  blue: 'bg-blue-50 border-blue-200 hover:border-blue-300',
};

const valueStyles: Record<string, string> = {
  default: 'text-slate-800',
  red: 'text-red-700',
  yellow: 'text-yellow-700',
  green: 'text-green-700',
  blue: 'text-blue-700',
};

export default function MetricCard({
  label,
  value,
  subLabel,
  variant = 'default',
  active = false,
  onClick,
}: MetricCardProps) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`flex-1 min-w-[120px] shrink-0 sm:shrink sm:min-w-0 border rounded-lg px-4 py-4 text-left transition
        ${variantStyles[variant]}
        ${active ? 'ring-2 ring-offset-1 ring-forest' : ''}
        ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest' : ''}
      `}
      aria-pressed={onClick ? active : undefined}
    >
      <div className={`text-2xl font-bold font-sans tabular-nums ${valueStyles[variant]}`}>
        {value}
      </div>
      <div className="text-xs font-sans font-medium text-slate-500 mt-1">{label}</div>
      {subLabel && (
        <div className="text-xs font-sans text-slate-400 mt-0.5">{subLabel}</div>
      )}
    </Tag>
  );
}
