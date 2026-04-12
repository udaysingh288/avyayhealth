import Image from "next/image";
import FadeSection from "./FadeSection";

export default function Founders() {
  return (
    <FadeSection id="team" className="bg-white">
      <div className="text-center mb-14">
        <div className="text-[#0D6B56] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
          Team
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1A1A] text-balance">
          Built by people who&apos;ve been inside your hospital
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {[
          {
            name: "Diksha Deshmukh",
            role: "CEO & Co-Founder",
            sub: "Clinical Research & Healthcare Expert, MPH",
            quote: "3 years inside hospital systems. 52 professionals surveyed before writing a line of code.",
            img: "/diksha.jpg",
            linkedin: "https://www.linkedin.com/in/dikshadeshmukh16/",
          },
          {
            name: "Kunwar Uday Singh",
            role: "Co-Founder",
            sub: "Data, AI/ML & Product Engineering",
            quote: "LLM classification engine, SMS infrastructure, real-time risk scoring. Healthcare data is my domain.",
            img: "/kunwar.jpg",
            linkedin: "https://www.linkedin.com/in/kunwaruday/",
          },
        ].map((person) => (
          <div key={person.name} className="bg-[#F9F7F2] rounded-2xl p-6 sm:p-8 hover-lift">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[#053027]/10">
                <Image src={person.img} alt={person.name} fill className="object-cover object-top" />
              </div>
              <div>
                <div className="font-semibold text-[#1A1A1A] text-base">{person.name}</div>
                <div className="text-[#6B7280] text-xs mt-0.5">{person.role} · {person.sub}</div>
              </div>
            </div>
            <p className="text-[#1A1A1A] text-sm leading-relaxed italic mb-4">
              &ldquo;{person.quote}&rdquo;
            </p>
            <a
              href={person.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#053027] hover:text-[#0D6B56] transition-colors text-sm font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          </div>
        ))}
      </div>
    </FadeSection>
  );
}
