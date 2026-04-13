export default function Footer() {
  return (
    <footer className="bg-[#053027] px-4 sm:px-6">
      <div className="max-w-7xl mx-auto py-14 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M16 28 C16 28 3 19 3 10.5 C3 6.91 5.91 4 9.5 4 C11.74 4 13.73 5.14 16 7.3 C18.27 5.14 20.26 4 22.5 4 C26.09 4 29 6.91 29 10.5 C29 19 16 28 16 28 Z"
                    fill="white"
                  />
                  <line x1="19" y1="6" x2="23" y2="14" stroke="rgba(5,48,39,0.7)" strokeWidth="1.2" strokeLinecap="round" />
                  <rect x="14.5" y="10" width="3" height="10" rx="0.8" fill="#053027" />
                  <rect x="11" y="13" width="10" height="3" rx="0.8" fill="#053027" />
                </svg>
              </div>
              <span className="text-white font-semibold text-base">Avyay Health</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              The care that follows you home. AI-powered post-discharge monitoring for community hospitals.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-4">Platform</h4>
            <div className="flex flex-col gap-2.5">
              {[
                ["Features", "#benefits"],
                ["Dashboard", "#dashboard"],
                ["How It Works", "#how-it-works"],
                ["Comparison", "#impact"],
              ].map(([label, href]) => (
                <a key={label} href={href} className="text-white/40 hover:text-white text-sm transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-4">Company</h4>
            <div className="flex flex-col gap-2.5">
              {[
                ["Team", "#team"],
                ["FAQ", "#faq"],
                ["Pilot Program", "#contact"],
                ["Contact", "#contact"],
              ].map(([label, href]) => (
                <a key={label} href={href} className="text-white/40 hover:text-white text-sm transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-4">Get In Touch</h4>
            <div className="flex flex-col gap-3 text-sm">
              <a href="mailto:diksha@avyayhealth.com" className="text-white/50 hover:text-white transition-colors">
                diksha@avyayhealth.com
              </a>
              <span className="text-white/30">
                United States
              </span>
              <div className="flex gap-3 mt-2">
                <a href="https://www.linkedin.com/company/avyayhealth/" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.08] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/25 text-xs">
            &copy; 2026 Avyay Health, Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-white/25">
            <a href="#" className="hover:text-white/50 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/50 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
