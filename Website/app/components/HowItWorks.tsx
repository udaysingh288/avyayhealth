import FadeSection from "./FadeSection";

export default function HowItWorks() {
  const steps = [
    { num: "01", title: "Enrollment" },
    { num: "02", title: "Daily Check-ins" },
    { num: "03", title: "Tapering Care" },
    { num: "04", title: "Red Alerts" },
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
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-200 bg-white text-[#6B7280] border-2 border-gray-200 group-hover:bg-[#053027] group-hover:text-white group-hover:border-[#053027] group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#053027]/25">
                {step.num}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 bg-gray-200 group-hover:bg-[#053027]/30 my-1 transition-colors" />
              )}
            </div>

            <div className="pb-10 sm:pb-12 pt-3">
              <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A]">{step.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </FadeSection>
  );
}
