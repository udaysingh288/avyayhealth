export default function Logo({ scrolled = false }: { scrolled?: boolean }) {
  return (
    <a href="#" className="flex items-center gap-2.5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${scrolled ? "bg-[#053027]" : "bg-white/15"}`}>
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 28 C16 28 3 19 3 10.5 C3 6.91 5.91 4 9.5 4 C11.74 4 13.73 5.14 16 7.3 C18.27 5.14 20.26 4 22.5 4 C26.09 4 29 6.91 29 10.5 C29 19 16 28 16 28 Z"
            fill="white"
          />
          <rect x="14.6" y="10.5" width="2.8" height="9" rx="0.6" fill={scrolled ? "#053027" : "rgba(5,48,39,0.9)"} />
          <rect x="11.5" y="13.6" width="9" height="2.8" rx="0.6" fill={scrolled ? "#053027" : "rgba(5,48,39,0.9)"} />
        </svg>
      </div>
      <span className={`text-lg font-bold tracking-tight ${scrolled ? "text-[#1A1A1A]" : "text-white"}`}>
        Avyay Health
      </span>
    </a>
  );
}
