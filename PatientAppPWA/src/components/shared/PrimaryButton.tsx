import { ReactNode } from 'react';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'orange' | 'white' | 'danger';
  type?: 'button' | 'submit';
  fullWidth?: boolean;
  icon?: ReactNode;
}

const variants = {
  primary: 'bg-primary text-white active:bg-primary-light disabled:bg-primary/40',
  orange: 'bg-orange text-white active:bg-orange-600 disabled:bg-orange/40',
  white: 'bg-white text-primary border-2 border-primary active:bg-primary-pale disabled:opacity-40',
  danger: 'bg-red-600 text-white active:bg-red-700 disabled:bg-red-300',
};

export default function PrimaryButton({
  children, onClick, disabled, loading, variant = 'primary',
  type = 'button', fullWidth = true, icon,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 min-h-[56px] px-6 py-4
        rounded-full font-display font-bold text-lg leading-none
        transition-all duration-150 select-none shadow-soft
        focus:outline-none focus:ring-4 focus:ring-primary/30
        ${fullWidth ? 'w-full' : ''}
        ${variants[variant]}
        ${disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <LoadingDots />
        </span>
      ) : (
        <>
          {icon && <span aria-hidden="true">{icon}</span>}
          {children}
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
          className="w-2 h-2 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
