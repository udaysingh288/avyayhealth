"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Features", href: "#benefits" },
    { label: "Platform", href: "#dashboard" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Impact", href: "#impact" },
    { label: "Team", href: "#team" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-[#053027]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Logo scrolled={scrolled} />
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={`transition-colors ${
                scrolled
                  ? "text-[#1A1A1A]/70 hover:text-[#053027]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              scrolled
                ? "bg-[#053027] text-white hover:bg-[#0D6B56] shadow-sm"
                : "bg-white text-[#053027] hover:bg-[#F9F7F2]"
            }`}
          >
            Book a Demo
          </a>
        </div>
        <button
          className={`md:hidden ${scrolled ? "text-[#1A1A1A]" : "text-white"}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            {menuOpen ? (
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white px-6 pb-6 pt-2 flex flex-col gap-4 shadow-lg border-t border-gray-100">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[#1A1A1A]/70 hover:text-[#053027] text-sm font-medium py-1"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="bg-[#053027] text-white px-5 py-3 rounded-xl font-semibold text-sm text-center"
            onClick={() => setMenuOpen(false)}
          >
            Book a Demo
          </a>
        </div>
      )}
    </nav>
  );
}
