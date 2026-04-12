"use client";

import DashboardMockup from "./DashboardMockup";
import SMSMockup from "./SMSMockup";

export default function DemoSection() {
  return (
    <section id="dashboard" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[#0D6B56] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Platform
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1A1A] mb-4 text-balance">
            One dashboard. Every patient. Real time.
          </h2>
          <p className="text-[#6B7280] text-base max-w-lg mx-auto">
            Browser-based coordinator dashboard with AI-classified patient risk. No software to install.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="mb-16">
          <DashboardMockup />
        </div>

        {/* Phone mockup + features side by side */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="flex justify-center">
            <SMSMockup />
          </div>
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] mb-3">
              Conversational AI that reads between the lines
            </h3>
            <p className="text-[#6B7280] text-sm leading-relaxed mb-8">
              Patients reply in their own words. Our AI classifies every response and flags deterioration before it becomes a readmission.
            </p>
            <div className="space-y-5">
              {[
                {
                  title: "Red Alerts",
                  desc: "Instant coordinator notification with full patient context",
                  color: "bg-[#C0392B]/10 text-[#C0392B]",
                },
                {
                  title: "AI Risk Scoring",
                  desc: "Every reply classified as Red, Yellow, or Green daily",
                  color: "bg-[#0D6B56]/10 text-[#0D6B56]",
                },
                {
                  title: "SDOH Screening",
                  desc: "CMS 5-domain framework built into every check-in",
                  color: "bg-[#053027]/10 text-[#053027]",
                },
                {
                  title: "SMS + App",
                  desc: "Meets patients where they are — no download required",
                  color: "bg-[#D97706]/10 text-[#D97706]",
                },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-4 group">
                  <div className={`${f.color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold transition-transform group-hover:scale-110`}>
                    {f.title.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#1A1A1A]">{f.title}</div>
                    <div className="text-xs text-[#6B7280] leading-relaxed mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
