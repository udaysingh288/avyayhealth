interface AvyayLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

const sizes = {
  sm: { icon: 32, title: 'text-lg', tag: 'text-xs' },
  md: { icon: 44, title: 'text-xl', tag: 'text-sm' },
  lg: { icon: 60, title: 'text-2xl', tag: 'text-sm' },
};

export default function AvyayLogo({ size = 'md', showTagline = false }: AvyayLogoProps) {
  const s = sizes[size];
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="bg-forest rounded-2xl flex items-center justify-center"
        style={{ width: s.icon, height: s.icon }}
      >
        <svg
          width={s.icon * 0.55}
          height={s.icon * 0.55}
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M14 2C9.58 2 6 5.58 6 10C6 15.5 14 26 14 26C14 26 22 15.5 22 10C22 5.58 18.42 2 14 2Z"
            fill="white"
            opacity="0.9"
          />
          <rect x="11" y="7" width="6" height="1.8" rx="0.9" fill="#27500A" />
          <rect x="12.1" y="6" width="3.8" height="6" rx="0.9" fill="#27500A" />
        </svg>
      </div>
      <div className="text-center">
        <div className={`font-serif text-forest ${s.title}`}>Avyay Health</div>
        {showTagline && (
          <div className={`font-sans text-slate-500 mt-0.5 ${s.tag}`}>
            The care that follows you home
          </div>
        )}
      </div>
    </div>
  );
}
