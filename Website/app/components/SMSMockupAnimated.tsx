"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const conversation = [
  { role: "ai" as const, text: "Hi Maria, how are you feeling today? Any swelling or shortness of breath?" },
  { role: "patient" as const, text: "My ankle is swollen and I feel tired." },
  { role: "ai" as const, text: "I\u2019ll flag this for your care team right away." },
  { role: "badge" as const, text: "Care team notified" },
];

export default function SMSMockupAnimated() {
  const [messages, setMessages] = useState<{ role: string; text: string; typed: string }[]>([]);
  const [phase, setPhase] = useState<"idle" | "dots" | "typing" | "pause">("idle");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, phase]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  const restart = useCallback(() => {
    setMessages([]);
    setCurrentIdx(0);
    setPhase("idle");
    setTimeout(() => setStarted(true), 600);
  }, []);

  useEffect(() => {
    if (!started) return;
    if (currentIdx >= conversation.length) {
      const t = setTimeout(restart, 4000);
      return () => clearTimeout(t);
    }
    const msg = conversation[currentIdx];
    if (msg.role === "badge") {
      const t = setTimeout(() => {
        setMessages((prev) => [...prev, { role: msg.role, text: msg.text, typed: msg.text }]);
        setCurrentIdx((i) => i + 1);
      }, 600);
      return () => clearTimeout(t);
    }
    setPhase("dots");
    const dotsTime = msg.role === "patient" ? 1000 : 700;
    const dotsTimer = setTimeout(() => {
      setPhase("typing");
      setMessages((prev) => [...prev, { role: msg.role, text: msg.text, typed: "" }]);
      let charIdx = 0;
      const speed = msg.role === "patient" ? 30 : 20;
      const typeInterval = setInterval(() => {
        charIdx++;
        if (charIdx <= msg.text.length) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], typed: msg.text.slice(0, charIdx) };
            return updated;
          });
        } else {
          clearInterval(typeInterval);
          setPhase("pause");
          setTimeout(() => setCurrentIdx((i) => i + 1), 500);
        }
      }, speed);
      return () => clearInterval(typeInterval);
    }, dotsTime);
    return () => clearTimeout(dotsTimer);
  }, [currentIdx, started, restart]);

  const AvatarIcon = () => (
    <div className="w-7 h-7 rounded-full bg-[#053027] flex items-center justify-center flex-shrink-0">
      <svg width="13" height="13" viewBox="0 0 32 32" fill="none">
        <path d="M16 28 C16 28 3 19 3 10.5 C3 6.91 5.91 4 9.5 4 C11.74 4 13.73 5.14 16 7.3 C18.27 5.14 20.26 4 22.5 4 C26.09 4 29 6.91 29 10.5 C29 19 16 28 16 28 Z" fill="white"/>
      </svg>
    </div>
  );

  const Dots = ({ variant }: { variant: "ai" | "patient" }) => (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full ${variant === "ai" ? "bg-[#053027]/30" : "bg-white/50"}`}
          style={{ animation: "dotBounce 1s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );

  const dotsRole = phase === "dots" && currentIdx < conversation.length ? conversation[currentIdx].role : null;

  return (
    <div ref={ref} className="relative mx-auto w-[280px]">
      <style>{`
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msg-in { animation: fadeUp 0.3s ease-out forwards; }
      `}</style>

      {/* Phone frame — 9:19.5 aspect ratio like iPhone */}
      <div className="bg-[#1A1A1A] rounded-[3rem] p-[10px] shadow-2xl ring-1 ring-white/5" style={{ aspectRatio: "9 / 19.5" }}>
        {/* Notch */}
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[90px] h-[26px] bg-[#1A1A1A] rounded-b-2xl z-20" />

        <div className="bg-[#F9F7F2] rounded-[2.2rem] overflow-hidden h-full flex flex-col">
          {/* Status bar */}
          <div className="bg-[#053027] px-6 pt-8 pb-2 flex justify-between items-center">
            <span className="text-white text-xs font-medium">9:31</span>
            <div className="flex gap-1 items-center">
              <div className="flex gap-[2px] items-end">
                {[3, 5, 7, 9].map((h, i) => (
                  <div key={i} className={`w-[3px] rounded-sm ${i < 3 ? "bg-white" : "bg-white/30"}`} style={{ height: h }} />
                ))}
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="ml-1">
                <rect x="1" y="6" width="18" height="12" rx="2" stroke="white" strokeWidth="1.5"/>
                <rect x="20" y="10" width="2" height="4" rx="0.5" fill="white"/>
                <rect x="3" y="8" width="8" height="8" rx="1" fill="white"/>
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="bg-[#053027] px-4 pb-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <path d="M16 28 C16 28 3 19 3 10.5 C3 6.91 5.91 4 9.5 4 C11.74 4 13.73 5.14 16 7.3 C18.27 5.14 20.26 4 22.5 4 C26.09 4 29 6.91 29 10.5 C29 19 16 28 16 28 Z" fill="white"/>
                <line x1="19" y1="6" x2="23" y2="14" stroke="rgba(5,48,39,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
                <rect x="14.5" y="10" width="3" height="10" rx="0.8" fill="#053027"/>
                <rect x="11" y="13" width="10" height="3" rx="0.8" fill="#053027"/>
              </svg>
            </div>
            <div>
              <div className="text-white text-sm font-semibold">Avyay Health</div>
              <div className="text-white/50 text-[11px]">Day 3 · Heart Failure</div>
            </div>
          </div>

          {/* Chat */}
          <div ref={chatRef} className="flex-1 px-3.5 py-4 space-y-3.5 bg-[#F9F7F2] overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className="msg-in">
                {msg.role === "ai" && (
                  <div className="flex gap-2 items-end">
                    <AvatarIcon />
                    <div className="bg-white rounded-2xl rounded-bl-md px-3.5 py-2.5 max-w-[82%] shadow-sm">
                      <p className="text-[#1A1A1A] text-[13px] leading-[1.5]">
                        {msg.typed}
                        <span className={phase === "typing" && i === messages.length - 1 ? "inline-block w-[2px] h-3.5 bg-[#053027]/60 ml-0.5 animate-pulse align-text-bottom" : "hidden"} />
                      </p>
                    </div>
                  </div>
                )}
                {msg.role === "patient" && (
                  <div className="flex justify-end">
                    <div className="bg-[#053027] text-white rounded-2xl rounded-br-md px-3.5 py-2.5 max-w-[78%]">
                      <p className="text-[13px] leading-[1.5]">
                        {msg.typed}
                        <span className={phase === "typing" && i === messages.length - 1 ? "inline-block w-[2px] h-3.5 bg-white/60 ml-0.5 animate-pulse align-text-bottom" : "hidden"} />
                      </p>
                    </div>
                  </div>
                )}
                {msg.role === "badge" && (
                  <div className="flex justify-center pt-1">
                    <div className="bg-[#D97706]/10 border border-[#D97706]/30 text-[#D97706] text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#D97706]" />
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {dotsRole === "ai" && (
              <div className="msg-in flex gap-2 items-end">
                <AvatarIcon />
                <div className="bg-white rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm">
                  <Dots variant="ai" />
                </div>
              </div>
            )}
            {dotsRole === "patient" && (
              <div className="msg-in flex justify-end">
                <div className="bg-[#053027] rounded-2xl rounded-br-md px-3.5 py-2.5">
                  <Dots variant="patient" />
                </div>
              </div>
            )}
          </div>

          {/* Bottom bar — fake input */}
          <div className="bg-[#F9F7F2] border-t border-[#053027]/10 px-3.5 py-2.5 flex items-center gap-2">
            <div className="flex-1 bg-white rounded-full px-3.5 py-2 text-[11px] text-gray-400 border border-gray-200">
              Type a message...
            </div>
            <div className="w-8 h-8 rounded-full bg-[#053027] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </div>
          </div>

          {/* Home indicator */}
          <div className="bg-[#F9F7F2] pb-2 pt-1 flex justify-center">
            <div className="w-[100px] h-[4px] rounded-full bg-[#1A1A1A]/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
