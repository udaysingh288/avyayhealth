import type { ReactNode } from 'react';

interface StatProps {
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'default' | 'danger' | 'success' | 'warn' | 'forest';
  icon?: ReactNode;
}

const toneMap: Record<NonNullable<StatProps['tone']>, string> = {
  default: 'text-slate-800',
  danger: 'text-danger',
  success: 'text-success',
  warn: 'text-warn',
  forest: 'text-forest',
};

export default function Stat({ label, value, sub, tone = 'default', icon }: StatProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
      <div className="flex items-start justify-between mb-2">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide font-sans">
          {label}
        </div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className={`text-[28px] font-bold tracking-tight font-sans ${toneMap[tone]}`}>
        {value}
      </div>
      {sub && <div className="text-[12px] text-slate-500 font-sans mt-1">{sub}</div>}
    </div>
  );
}
