"use client";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#053027]">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#053027] via-[#0D6B56]/40 to-[#053027]" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "40px 40px"
      }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-32">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] mb-6 text-balance">
          The care that follows you home
        </h1>
        <p className="text-white/60 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          AI care companion that contacts every discharged patient daily for 30 days and alerts your care team before deterioration becomes a readmission.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#contact" className="bg-white text-[#053027] px-8 py-3.5 rounded-full font-semibold text-base hover:bg-[#FFF8E7] transition-all hover:shadow-lg hover:shadow-white/20 hover:scale-[1.02]">
            Book a 20-Minute Call
          </a>
          <a href="#dashboard" className="text-white/70 hover:text-white font-medium text-sm transition-colors flex items-center gap-2">
            Scroll to Discover
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </a>
        </div>

        {/* Three pillars */}
        <div className="mt-20 grid grid-cols-3 gap-6 sm:gap-10 max-w-xl mx-auto">
          {[
            { label: "No Hardware", sub: "SMS or app" },
            { label: "ADT Feed Only", sub: "No EHR write-back" },
            { label: "Live in <1 Week", sub: "Zero IT lift" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-white text-sm font-semibold">{item.label}</div>
              <div className="text-white/40 text-xs mt-1">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
