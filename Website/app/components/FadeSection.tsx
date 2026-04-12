"use client";

import { useFadeIn } from "../hooks/useFadeIn";

export default function FadeSection({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useFadeIn();
  return (
    <section id={id} className={`py-16 sm:py-20 md:py-24 px-4 sm:px-6 ${className}`}>
      <div ref={ref} className="fade-in max-w-6xl mx-auto">
        {children}
      </div>
    </section>
  );
}
