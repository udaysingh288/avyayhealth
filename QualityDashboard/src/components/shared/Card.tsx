import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, subtitle, action, children, className = '' }: CardProps) {
  return (
    <section
      className={`bg-white rounded-xl border border-slate-200 shadow-card ${className}`}
    >
      {(title || subtitle || action) && (
        <header className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            {title && (
              <h3 className="text-[15px] font-semibold text-slate-800 font-sans tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[12px] text-slate-500 font-sans mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </header>
      )}
      <div className="px-5 pb-5">{children}</div>
    </section>
  );
}
