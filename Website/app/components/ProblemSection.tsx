"use client";

import QuoteScroller from "./QuoteScroller";

export default function ProblemSection() {
  return (
    <section id="problem" className="relative overflow-hidden">
      {/* Dark section with gradient */}
      <div className="bg-[#053027] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#053027] via-[#0a4035] to-[#053027]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-14">
            <div className="text-[#0D6B56] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              The Post-Discharge Gap
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-4 text-balance">
              Your patients leave. Most systems lose them.
            </h2>
            <p className="text-white/50 text-sm">
              From 52 hospital professionals surveyed — March 2026
            </p>
          </div>

          {/* Large stat cards — Fourier data card style */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {[
              { stat: "8 in 10", desc: "rank readmission reduction as their top priority" },
              { stat: "46%", desc: "can\u2019t reach patients after discharge" },
              { stat: "46%", desc: "still rely on manual nurse follow-up calls" },
              { stat: "~20%", desc: "of Medicare patients readmitted in 30 days" },
            ].map((item) => (
              <div key={item.stat} className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-5 sm:p-7 hover-lift cursor-default">
                <div className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-2">{item.stat}</div>
                <p className="text-white/50 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Quote scroller */}
          <QuoteScroller />
        </div>
      </div>

    </section>
  );
}
