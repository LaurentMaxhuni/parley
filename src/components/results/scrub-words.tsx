"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrubWordsProps {
  text: string;
  className?: string;
  wordClassName?: string;
}

/**
 * Splits a paragraph into spans per word. Each word's opacity scrubs from
 * 0.15 to 1.0 sequentially as the parent passes through the viewport.
 * Honors reduced-motion: if user prefers reduced motion, words stay at 1.0.
 */
export function ScrubWords({ text, wordClassName = "" }: ScrubWordsProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLSpanElement>("[data-word]");
    if (words.length === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      words.forEach((w) => (w.style.opacity = "1"));
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.04,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "bottom 60%",
            scrub: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [text]);

  const words = text.split(/(\s+)/);

  return (
    <p ref={ref} className="text-balance">
      {words.map((w, i) =>
        /^\s+$/.test(w) ? (
          <span key={i}>{w}</span>
        ) : (
          <span key={i} data-word className={wordClassName} style={{ opacity: 0.15 }}>
            {w}
          </span>
        )
      )}
    </p>
  );
}
