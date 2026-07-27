"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    gsap.fromTo(
      el,
      { autoAlpha: 0, x: 12 },
      { autoAlpha: 1, x: 0, duration: 0.5, ease: "power3.out" }
    );
  }, []);

  return (
    <div className="min-h-screen bg-ink">
      <DashboardSidebar />
      <main ref={mainRef} className="lg:ml-[280px] min-h-screen">
        {children}
      </main>
    </div>
  );
}
