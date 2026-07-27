"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CardStackerProps {
  children: React.ReactNode[];
  className?: string;
}

export function CardStacker({ children, className = "" }: CardStackerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const cards = el.querySelectorAll<HTMLElement>("[data-stack-card]");
    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        const offset = i * 60;
        gsap.set(card, { y: offset, scale: 0.92, opacity: 0.5 });

        ScrollTrigger.create({
          trigger: card,
          start: "top bottom-=100",
          end: "top center+=120",
          onEnter: () => {
            gsap.to(card, {
              y: 0,
              scale: 1,
              opacity: 1,
              duration: 0.7,
              ease: "power3.out",
              delay: i * 0.1,
            });
          },
          onLeaveBack: () => {
            gsap.to(card, {
              y: offset,
              scale: 0.92,
              opacity: 0.5,
              duration: 0.5,
              ease: "power2.out",
            });
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [children.length]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children.map((child, i) => (
        <div key={i} data-stack-card className="relative" style={{ zIndex: children.length - i }}>
          {child}
        </div>
      ))}
    </div>
  );
}
