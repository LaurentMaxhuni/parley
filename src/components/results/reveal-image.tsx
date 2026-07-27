"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface RevealImageProps {
  src: string;
  alt?: string;
  className?: string;
}

/**
 * Image that starts at scale: 0.85, fades & brightens in, then darkens
 * back down as it leaves the viewport. Uses IntersectionObserver so it's
 * cheap and doesn't need ScrollTrigger for every image.
 */
export function RevealImage({ src, alt = "", className = "" }: RevealImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              el,
              { scale: 0.85, opacity: 0.4, filter: "brightness(0.6) saturate(0.8)" },
              {
                scale: 1,
                opacity: 1,
                filter: "brightness(1) saturate(1)",
                duration: 1.1,
                ease: "power3.out",
              }
            );
          } else {
            gsap.to(el, {
              opacity: 0.25,
              filter: "brightness(0.4) saturate(0.6)",
              duration: 0.5,
              ease: "power2.out",
            });
          }
        });
      },
      { threshold: 0.25 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ transformOrigin: "center" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${src})` }}
        aria-label={alt}
        role="img"
      />
    </div>
  );
}
