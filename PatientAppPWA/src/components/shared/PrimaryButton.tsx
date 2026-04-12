import { ReactNode } from 'react';
import { haptic } from '../../utils/haptics';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'white' | 'danger';
  type?: 'button' | 'submit';
  fullWidth?: boolean;
  icon?: ReactNode;
  trailing?: ReactNode;
}

const variants: Record<string, string> = {
  primary:
    'bg-primary text-white shadow-ios active:bg-primary-light disabled:bg-primary/30',
  secondary:
    'bg-primary-pale text-primary shadow-ios-sm active:bg-primary-soft disabled:opacity-50',
  white:
    'bg-white text-primary border border-primary/25 shadow-ios-sm active:bg-primary-pale disabled:opacity-50',
  danger:
    'bg-[#DC2626] text-white shadow-ios active:bg-[#B91C1C] disabled:bg-red-300',
};

export default function PrimaryButton({
  children,
  onClick,
  disabled,
  loading,
  variant = 'primary',
  type = 'button',
  fullWidth = true,
  icon,
  trailing,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={() => {
        if (disabled || loading) return;
        haptic('medium');
        onClick?.();
      }}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center gap-2 min-h-[54px] px-6
        rounded-full font-sans font-semibold text-[17px] leading-none tracking-[-0.01em]
        transition-all duration-150 ease-ios select-none
        focus:outline-none focus:ring-4 focus:ring-primary/20
        active:scale-[0.97]
        ${fullWidth ? 'w-full' : ''}
        ${variants[variant]}
        ${disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {loading ? (
        <LoadingDots />
      ) : (
        <>
          {icon && <span className="flex items-center" aria-hidden="true">{icon}</span>}
          <span>{children}</span>
          {trailing && <span className="flex items-center" aria-hidden="true">{trailing}</span>}
        </>
      )}
    </button>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-1.5 items-center" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current animate-bounce opacity-80"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
