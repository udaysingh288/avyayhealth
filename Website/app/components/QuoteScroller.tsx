"use client";

const quotes = [
  { text: "Many patients don\u2019t answer the phone. Without a verified number, we simply cannot follow up.", role: "Discharge Nurse" },
  { text: "We spend hours making calls that go to voicemail. It\u2019s exhausting and ineffective.", role: "Care Coordinator" },
  { text: "By the time we reach a patient, they\u2019ve already been readmitted.", role: "Quality Director" },
  { text: "Patients forget discharge instructions within 48 hours. We have no way to reinforce them.", role: "Clinical Nurse Manager" },
  { text: "Our biggest challenge is patients who seem fine at discharge but deteriorate silently at home.", role: "Hospitalist" },
  { text: "We know which patients are at risk. We just don\u2019t have the bandwidth to check on all of them.", role: "Nurse Navigator" },
];

export default function QuoteScroller() {
  const allQuotes = [...quotes, ...quotes];

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[#053027] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[#053027] to-transparent z-10 pointer-events-none" />

      <div className="flex gap-4 animate-marquee">
        {allQuotes.map((q, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[300px] sm:w-[340px] bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl p-5 transition-all duration-200 hover:bg-white/[0.1] hover:border-white/20"
          >
            <p className="text-white/80 text-sm leading-relaxed mb-3">
              &ldquo;{q.text}&rdquo;
            </p>
            <div className="text-white/40 text-xs font-medium">{q.role} · Survey 2026</div>
          </div>
        ))}
      </div>
    </div>
  );
}
