"use client";

import { useRef, useState } from "react";
import gsap from "gsap";

interface AccordionPanel {
  label: string;
  content: React.ReactNode;
  accent?: string;
}

interface HorizontalAccordionProps {
  panels: AccordionPanel[];
  className?: string;
}

export function HorizontalAccordion({ panels, className = "" }: HorizontalAccordionProps) {
  const [active, setActive] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  function handleMouseEnter(index: number) {
    setActive(index);
  }

  function handleMouseLeave() {
    setActive(null);
  }

  return (
    <div
      ref={trackRef}
      className={`flex h-64 w-full overflow-hidden rounded-xl border border-ink-line bg-ink/40 ${className}`}
    >
      {panels.map((panel, i) => {
        const isExpanded = active === i;
        const flex = isExpanded ? "flex-[3]" : "flex-[1]";
        const isAnyActive = active !== null;

        return (
          <div
            key={i}
            className={`relative cursor-pointer transition-all duration-700 ease-out overflow-hidden ${flex}`}
            style={{
              borderRight: i < panels.length - 1 ? "1px solid var(--color-ink-line)" : "none",
              transition: "flex 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex h-full flex-col justify-between p-5">
              <div className="flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: panel.accent ?? "var(--color-brass)" }}
                />
                <span
                  className="text-xs font-mono uppercase tracking-wider whitespace-nowrap"
                  style={{ color: panel.accent ?? "var(--color-brass-soft)" }}
                >
                  {panel.label}
                </span>
              </div>

              <div
                className="transition-all duration-700 ease-out"
                style={{
                  opacity: isExpanded ? 1 : isAnyActive ? 0.2 : 0.5,
                  transform: isExpanded ? "translateY(0)" : "translateY(8px)",
                }}
              >
                {panel.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
