export default function Footer() {
  return (
    <footer className="bg-[#053027] border-t border-white/10 px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
        {/* Logo + name */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 28 C16 28 3 19 3 10.5 C3 6.91 5.91 4 9.5 4 C11.74 4 13.73 5.14 16 7.3 C18.27 5.14 20.26 4 22.5 4 C26.09 4 29 6.91 29 10.5 C29 19 16 28 16 28 Z"
                fill="white"
              />
              <rect x="14.6" y="10.5" width="2.8" height="9" rx="0.6" fill="#053027" />
              <rect x="11.5" y="13.6" width="9" height="2.8" rx="0.6" fill="#053027" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">Avyay Health</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-white/50">
          {[
            ["Platform", "#dashboard"],
            ["How It Works", "#how-it-works"],
            ["Team", "#team"],
            ["Contact", "#contact"],
          ].map(([label, href]) => (
            <a key={label} href={href} className="hover:text-white transition-colors">
              {label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 text-xs text-white/40">
          <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/[0.06] text-center text-xs text-white/30">
        Avyay Health, Inc. · Jersey City, NJ · 2026
      </div>
    </footer>
  );
}
