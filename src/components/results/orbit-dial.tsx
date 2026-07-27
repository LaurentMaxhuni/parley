"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface OrbitDialProps {
  score: number;
  verdict: "hold_firm" | "counter" | "compromise" | "walk_away";
  label?: string;
}

const VERDICT_META: Record<
  OrbitDialProps["verdict"],
  { label: string; color: string; ring: string; pulse: boolean }
> = {
  hold_firm: { label: "Hold firm", color: "#4c7a5e", ring: "#4c7a5e", pulse: false },
  counter: { label: "Send a counter", color: "#b08d57", ring: "#b08d57", pulse: true },
  compromise: { label: "Compromise", color: "#d8c39a", ring: "#d8c39a", pulse: false },
  walk_away: { label: "Walk away", color: "#c1402a", ring: "#c1402a", pulse: true },
};

/**
 * Concentric orbital dial that rotates continuously while idle and snaps
 * to the verdict angle when shown. Two rings, a center value, and a small
 * pulsing marker to communicate verdict urgency without shouting.
 */
export function OrbitDial({ score, verdict, label = "Deal health" }: OrbitDialProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const meta = VERDICT_META[verdict];
  const clamped = Math.min(100, Math.max(0, score));

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduce) {
      gsap.to(outerRef.current, { rotate: "+=360", duration: 40, ease: "none", repeat: -1 });
      gsap.to(innerRef.current, { rotate: "-=360", duration: 60, ease: "none", repeat: -1 });
    }

    if (meta.pulse && !reduce && pulseRef.current) {
      gsap.to(pulseRef.current, {
        scale: 1.4,
        opacity: 0.4,
        duration: 1.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }

    if (valueRef.current && !reduce) {
      const obj = { v: 0 };
      gsap.to(obj, {
        v: clamped,
        duration: 1.4,
        ease: "power3.out",
        onUpdate: () => {
          if (valueRef.current) valueRef.current.textContent = Math.round(obj.v).toString();
        },
      });
    } else if (valueRef.current) {
      valueRef.current.textContent = clamped.toString();
    }
  }, [clamped, meta.pulse]);

  return (
    <div className="relative mx-auto flex h-[320px] w-[320px] items-center justify-center md:h-[400px] md:w-[400px]">
      <div
        ref={outerRef}
        className="absolute inset-0 rounded-full border border-dashed border-ink-line"
        style={{ borderColor: `${meta.ring}40` }}
      >
        <div
          className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: meta.ring }}
        />
        <div
          className="absolute -bottom-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full opacity-50"
          style={{ backgroundColor: meta.ring }}
        />
      </div>

      <div
        ref={innerRef}
        className="absolute inset-8 rounded-full border border-ink-line md:inset-12"
        style={{ borderColor: `${meta.ring}30` }}
      />

      <div
        ref={pulseRef}
        className="absolute h-20 w-20 rounded-full opacity-20 blur-2xl md:h-28 md:w-28"
        style={{ backgroundColor: meta.color }}
      />

      <div className="relative z-10 flex flex-col items-center gap-1">
        <span
          ref={valueRef}
          className="font-display text-7xl font-light leading-none text-cream md:text-8xl"
        >
          {clamped}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-text">
          {label}
        </span>
        <span
          className="mt-2 font-display text-xl italic md:text-2xl"
          style={{ color: meta.color }}
        >
          {meta.label}
        </span>
      </div>
    </div>
  );
}
