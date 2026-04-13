export default function Logo({ scrolled = false }: { scrolled?: boolean }) {
  return (
    <a href="#" className="flex items-center gap-2.5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${scrolled ? "bg-[#053027]" : "bg-white/15"}`}>
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          {/* Heart shape */}
          <path
            d="M16 28 C16 28 3 19 3 10.5 C3 6.91 5.91 4 9.5 4 C11.74 4 13.73 5.14 16 7.3 C18.27 5.14 20.26 4 22.5 4 C26.09 4 29 6.91 29 10.5 C29 19 16 28 16 28 Z"
            fill="white"
          />
          {/* Diagonal line on right lobe */}
          <line x1="19" y1="6" x2="23" y2="14" stroke={scrolled ? "#053027" : "rgba(5,48,39,0.7)"} strokeWidth="1.2" strokeLinecap="round" />
          {/* Medical cross — vertical bar */}
          <rect x="14.5" y="10" width="3" height="10" rx="0.8" fill={scrolled ? "#053027" : "rgba(5,48,39,0.9)"} />
          {/* Medical cross — horizontal bar */}
          <rect x="11" y="13" width="10" height="3" rx="0.8" fill={scrolled ? "#053027" : "rgba(5,48,39,0.9)"} />
        </svg>
      </div>
      <span className={`text-lg font-bold tracking-tight ${scrolled ? "text-[#1A1A1A]" : "text-white"}`}>
        Avyay Health
      </span>
    </a>
  );
}
