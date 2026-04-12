import FadeSection from "./FadeSection";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Enrollment",
      body: "Nurse enrolls patient at discharge. Welcome SMS arrives within 24 hours. No hardware. No app download. Works on any phone.",
    },
    {
      num: "02",
      title: "Daily Check-ins",
      body: "Days 1\u20137. AI asks about symptoms, medications, and recovery. Reads free-text replies \u2014 not just button taps.",
    },
    {
      num: "03",
      title: "Tapering Care",
      body: "Days 8\u201330. Check-ins taper as the patient stabilizes. SDOH screening across all CMS 5 domains with community resource referrals.",
    },
    {
      num: "04",
      title: "Red Alerts",
      body: "Anytime. Flagged symptoms trigger an instant coordinator notification with full patient summary. Response SLA: under 2 hours.",
    },
  ];

  return (
    <FadeSection id="how-it-works" className="bg-[#F9F7F2]">
      <div className="text-center mb-14">
        <div className="text-[#0D6B56] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
          How It Works
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1A1A] text-balance">
          From discharge to 30 days — automated
        </h2>
      </div>

      <div className="max-w-3xl mx-auto space-y-0">
        {steps.map((step, i) => (
          <div key={step.num} className="relative flex gap-6 sm:gap-8 group">
            {/* Vertical line connector */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-200 group-hover:scale-110 ${
                i === steps.length - 1
                  ? "bg-[#053027] text-white group-hover:shadow-lg group-hover:shadow-[#053027]/25"
                  : "bg-white text-[#053027] border-2 border-[#053027]/20 group-hover:border-[#053027]/50 group-hover:bg-[#053027] group-hover:text-white"
              }`}>
                {step.num}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 bg-[#053027]/15 my-1" />
              )}
            </div>

            {/* Content */}
            <div className="pb-10 sm:pb-12 pt-1">
              <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] mb-2">{step.title}</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed max-w-lg">{step.body}</p>
            </div>
          </div>
        ))}
      </div>
    </FadeSection>
  );
}
