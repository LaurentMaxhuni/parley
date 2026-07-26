"use client";

import { useEffect, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import gsap from "gsap";

ChartJS.register(ArcElement, Tooltip);

const ZONE_COLORS = {
  walkAway: "#c1402a", // redline
  counter: "#b08d57", // brass
  holdFirm: "#4c7a5e", // sage
};

interface DealHealthGaugeProps {
  score: number; // 0-100
  label?: string;
}

/**
 * A half-circle "gauge" built from a Chart.js doughnut chart (three fixed
 * zones) with a hand-animated needle (GSAP) swept in on mount/update. This
 * is the one deliberately eye-catching element in the app — everything else
 * stays quiet so this reads clearly as the "verdict" moment.
 */
export function DealHealthGauge({ score, label = "Deal Health" }: DealHealthGaugeProps) {
  const needleRef = useRef<HTMLDivElement>(null);
  const clamped = Math.min(100, Math.max(0, score));

  useEffect(() => {
    // Gauge sweeps a half circle: -90deg (score 0) to +90deg (score 100).
    const targetAngle = -90 + (clamped / 100) * 180;
    if (needleRef.current) {
      gsap.fromTo(
        needleRef.current,
        { rotate: -90 },
        { rotate: targetAngle, duration: 1.1, ease: "elastic.out(1, 0.65)" }
      );
    }
  }, [clamped]);

  const zoneLabel = clamped >= 67 ? "Hold firm" : clamped >= 34 ? "Counter" : "Walk away";
  const zoneColor =
    clamped >= 67 ? ZONE_COLORS.holdFirm : clamped >= 34 ? ZONE_COLORS.counter : ZONE_COLORS.walkAway;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[130px] w-[260px]">
        <Doughnut
          data={{
            labels: ["Walk away", "Counter", "Hold firm"],
            datasets: [
              {
                data: [33.3, 33.4, 33.3],
                backgroundColor: [ZONE_COLORS.walkAway, ZONE_COLORS.counter, ZONE_COLORS.holdFirm],
                borderWidth: 0,
              },
            ],
          }}
          options={{
            rotation: -90,
            circumference: 180,
            cutout: "70%",
            plugins: { tooltip: { enabled: false }, legend: { display: false } },
            animation: false,
          }}
        />
        {/* Needle, pivoted from the bottom-center of the semicircle */}
        <div
          ref={needleRef}
          className="absolute bottom-0 left-1/2 h-[100px] w-[3px] origin-bottom rounded-full bg-cream"
          style={{ marginLeft: "-1.5px" }}
        />
        <div className="absolute bottom-[-6px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-cream" />
      </div>

      <div className="mt-3 flex flex-col items-center gap-1">
        <span className="font-mono text-3xl font-semibold text-cream">{clamped}</span>
        <span className="text-xs uppercase tracking-wide text-slate-text">{label}</span>
        <span className="font-mono text-sm font-medium" style={{ color: zoneColor }}>
          {zoneLabel}
        </span>
      </div>
    </div>
  );
}
