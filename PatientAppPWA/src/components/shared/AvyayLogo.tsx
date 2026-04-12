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
        className="bg-primary rounded-2xl flex items-center justify-center"
        style={{ width: s.icon, height: s.icon }}
      >
        <svg
          width={s.icon * 0.6}
          height={s.icon * 0.6}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M16 28 C16 28 3 19 3 10.5 C3 6.91 5.91 4 9.5 4 C11.74 4 13.73 5.14 16 7.3 C18.27 5.14 20.26 4 22.5 4 C26.09 4 29 6.91 29 10.5 C29 19 16 28 16 28 Z"
            fill="white"
          />
          <rect x="14.6" y="9" width="2.8" height="9" rx="0.6" fill="#053027" />
          <rect x="11.5" y="12.1" width="9" height="2.8" rx="0.6" fill="#053027" />
        </svg>
      </div>
      <div className="text-center">
        <div className={`font-serif text-primary ${s.title}`}>Avyay Health</div>
        {showTagline && (
          <div className={`font-sans text-slate-500 mt-0.5 ${s.tag}`}>
            The care that follows you home
          </div>
        )}
      </div>
    </div>
  );
}
