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

      {/* Financial impact — white section */}
      <div className="bg-white px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1A1A1A] text-balance">
              The cost of doing nothing
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-5 mt-10">
            {[
              { value: "$15K", desc: "average cost per preventable readmission" },
              { value: "2,400+", desc: "hospitals penalized under HRRP in FY2026" },
              { value: "$1M+", desc: "annual penalty exposure for a 300-bed hospital" },
            ].map((item) => (
              <div key={item.value} className="text-center p-8 rounded-2xl bg-[#F9F7F2] hover-lift cursor-default">
                <div className="font-serif text-4xl sm:text-5xl text-[#053027] mb-2">{item.value}</div>
                <p className="text-[#6B7280] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
