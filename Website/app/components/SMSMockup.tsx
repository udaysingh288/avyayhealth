export default function SMSMockup() {
  return (
    <div className="relative mx-auto w-[260px] sm:w-[280px]">
      <div className="bg-[#1A1A1A] rounded-[2.5rem] p-3 shadow-2xl ring-1 ring-black/10">
        <div className="bg-[#F9F7F2] rounded-[2rem] overflow-hidden">
          {/* Status bar */}
          <div className="bg-[#053027] px-6 py-2.5 flex justify-between items-center">
            <span className="text-white text-xs font-medium">9:31 AM</span>
            <div className="flex gap-1.5 items-center">
              <div className="flex gap-0.5 items-end">
                {[3, 5, 7, 9].map((h, i) => (
                  <div key={i} className={`w-1 rounded-sm ${i < 3 ? "bg-white" : "bg-white/30"}`} style={{ height: h }} />
                ))}
              </div>
              <div className="w-4.5 h-3 rounded-sm border border-white/60 flex items-center px-0.5">
                <div className="w-2 h-1.5 bg-white rounded-sm" />
              </div>
            </div>
          </div>
          {/* Header */}
          <div className="bg-[#053027] px-5 pb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <path d="M16 28 C16 28 3 19 3 10.5 C3 6.91 5.91 4 9.5 4 C11.74 4 13.73 5.14 16 7.3 C18.27 5.14 20.26 4 22.5 4 C26.09 4 29 6.91 29 10.5 C29 19 16 28 16 28 Z" fill="white"/>
                <line x1="19" y1="6" x2="23" y2="14" stroke="rgba(5,48,39,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
                <rect x="14.5" y="10" width="3" height="10" rx="0.8" fill="#053027"/>
                <rect x="11" y="13" width="10" height="3" rx="0.8" fill="#053027"/>
              </svg>
            </div>
            <div>
              <div className="text-white text-sm font-semibold">Avyay Health</div>
              <div className="text-white/50 text-xs">Day 3 · Heart Failure</div>
            </div>
          </div>

          {/* Chat messages */}
          <div className="px-4 py-5 space-y-4 bg-[#F9F7F2]">
            {/* AI */}
            <div className="flex gap-2.5 items-end">
              <div className="w-7 h-7 rounded-full bg-[#053027] flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                  <path d="M16 28 C16 28 3 19 3 10.5 C3 6.91 5.91 4 9.5 4 C11.74 4 13.73 5.14 16 7.3 C18.27 5.14 20.26 4 22.5 4 C26.09 4 29 6.91 29 10.5 C29 19 16 28 16 28 Z" fill="white"/>
                </svg>
              </div>
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%] shadow-sm">
                <p className="text-[#1A1A1A] text-[13px] leading-relaxed">Hi Maria, how are you feeling today? Any swelling or shortness of breath?</p>
              </div>
            </div>

            {/* Patient */}
            <div className="flex justify-end">
              <div className="bg-[#053027] text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[75%]">
                <p className="text-[13px] leading-relaxed">My ankle is swollen and I feel tired.</p>
              </div>
            </div>

            {/* AI */}
            <div className="flex gap-2.5 items-end">
              <div className="w-7 h-7 rounded-full bg-[#053027] flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                  <path d="M16 28 C16 28 3 19 3 10.5 C3 6.91 5.91 4 9.5 4 C11.74 4 13.73 5.14 16 7.3 C18.27 5.14 20.26 4 22.5 4 C26.09 4 29 6.91 29 10.5 C29 19 16 28 16 28 Z" fill="white"/>
                </svg>
              </div>
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%] shadow-sm">
                <p className="text-[#1A1A1A] text-[13px] leading-relaxed">I&apos;ll flag this for your care team right away.</p>
              </div>
            </div>

            {/* Badge */}
            <div className="flex justify-center pt-1">
              <div className="bg-[#D97706]/10 border border-[#D97706]/30 text-[#D97706] text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#D97706]" />
                Care team notified
              </div>
            </div>

            {/* Quick replies */}
            <div className="flex gap-2 pt-1">
              <div className="bg-white border border-[#053027]/15 text-[#053027] text-xs font-medium px-4 py-2 rounded-full">
                Tell me more
              </div>
              <div className="bg-white border border-[#053027]/15 text-[#053027] text-xs font-medium px-4 py-2 rounded-full">
                I&apos;m okay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
