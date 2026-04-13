import FadeSection from "./FadeSection";

const benefits = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#053027" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
      </svg>
    ),
    title: "Conversational AI Check-ins",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#053027" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    title: "Instant Red Alerts",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#053027" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Real-Time Dashboard",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#053027" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    ),
    title: "Zero-Friction Enrollment",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#053027" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
      </svg>
    ),
    title: "SDOH Screening Built In",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#053027" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: "Revenue, Not Cost",
  },
];

export default function Benefits() {
  return (
    <FadeSection id="benefits" className="bg-white">
      <div className="text-center mb-14">
        <div className="text-[#0D6B56] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
          Why Avyay
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1A1A] mb-4 text-balance">
          Everything your care team needs. Nothing they don&apos;t.
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((b) => (
          <div key={b.title} className="group bg-[#F9F7F2] rounded-2xl p-7 hover-lift cursor-default border border-transparent hover:border-[#053027]/10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-xl bg-[#053027]/[0.07] flex items-center justify-center mb-5 group-hover:bg-[#053027]/[0.12] transition-colors">
              {b.icon}
            </div>
            <h3 className="font-semibold text-[#1A1A1A] text-lg">{b.title}</h3>
          </div>
        ))}
      </div>
    </FadeSection>
  );
}
