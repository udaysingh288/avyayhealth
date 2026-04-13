"use client";

import { useState, useEffect } from "react";
import FadeSection from "./FadeSection";

const testimonials = [
  {
    text: "Many patients don\u2019t answer the phone. Often their contact info in the EMR is not accurate. Without a verified number, we simply cannot follow up.",
    role: "Discharge Nurse",
    org: "Community Hospital",
    source: "Survey Respondent, March 2026",
  },
  {
    text: "We spend hours making calls that go to voicemail. It\u2019s exhausting and ineffective. We need something that reaches patients where they are.",
    role: "Care Coordinator",
    org: "Regional Medical Center",
    source: "Survey Respondent, March 2026",
  },
  {
    text: "By the time we reach a patient, they\u2019ve already been readmitted. We need a system that catches deterioration before it reaches the ER.",
    role: "Quality Director",
    org: "Community Hospital",
    source: "Survey Respondent, March 2026",
  },
  {
    text: "Patients forget discharge instructions within 48 hours. We have no way to reinforce them daily without burning out our staff.",
    role: "Clinical Nurse Manager",
    org: "Teaching Hospital",
    source: "Survey Respondent, March 2026",
  },
  {
    text: "Our biggest challenge is patients who seem fine at discharge but deteriorate silently at home. We need eyes on them every day.",
    role: "Hospitalist",
    org: "Community Hospital",
    source: "Survey Respondent, March 2026",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <FadeSection className="bg-[#053027]">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-[#0D6B56] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
          From 52 Hospital Professionals
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-white mb-12 text-balance">
          What your peers are saying
        </h2>

        {/* Stars */}
        <div className="flex justify-center gap-1 mb-8">
          {[...Array(5)].map((_, i) => (
            <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#D97706">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>

        {/* Quote */}
        <div className="min-h-[140px] flex items-center justify-center">
          <div className="transition-all duration-500">
            <p className="text-white text-lg sm:text-xl leading-relaxed mb-6 max-w-2xl mx-auto font-serif italic">
              &ldquo;{testimonials[active].text}&rdquo;
            </p>
            <div className="text-white/60 text-sm">
              <span className="font-semibold text-white/80">{testimonials[active].role}</span>
              <span className="mx-2">&middot;</span>
              <span>{testimonials[active].org}</span>
            </div>
            <div className="text-white/30 text-xs mt-1">{testimonials[active].source}</div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === active ? "bg-white w-8" : "bg-white/25 hover:bg-white/40"
              }`}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </FadeSection>
  );
}
