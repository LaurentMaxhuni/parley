"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Calculator, TrendUp, Clock, User, Target } from "@phosphor-icons/react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CardStacker } from "@/components/results/card-stacker";

function asNumber(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatHours(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function AnimatedMetric({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const display = new Intl.NumberFormat("en-US", {
    style: prefix === "$" ? "currency" : "decimal",
    currency: prefix === "$" ? "USD" : undefined,
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { el.textContent = display.format(value) + (suffix ? ` ${suffix}` : ""); return; }

    const obj = { v: 0 };
    gsap.to(obj, {
      v: value,
      duration: 1.2,
      ease: "power4.out",
      onUpdate: () => {
        if (el) el.textContent = display.format(Math.round(obj.v)) + (suffix ? ` ${suffix}` : "");
      },
    });
  }, [value]);

  return (
    <span ref={ref} className="font-mono text-3xl text-cream md:text-4xl">
      {display.format(value)}{suffix ? ` ${suffix}` : ""}
    </span>
  );
}

export default function CalculatorPage() {
  const [income, setIncome] = useState("90000");
  const [costs, setCosts] = useState("18000");
  const [hours, setHours] = useState("20");
  const [utilization, setUtilization] = useState("70");
  const [weeks, setWeeks] = useState("46");
  const [buffer, setBuffer] = useState("25");
  const resultRef = useRef<HTMLDivElement>(null);
  const fieldsRef = useRef<HTMLDivElement>(null);
  const prevCalc = useRef({ floor: 0, target: 0, billableHours: 0, projectDay: 0 });

  const calculation = useMemo(() => {
    const annualIncome = asNumber(income);
    const annualCosts = asNumber(costs);
    const weeklyHours = asNumber(hours);
    const rate = Math.min(100, asNumber(utilization));
    const workWeeks = asNumber(weeks);
    const margin = asNumber(buffer);
    const billableHours = weeklyHours * workWeeks * (rate / 100);
    const floor = billableHours > 0 ? (annualIncome + annualCosts) / billableHours : 0;
    return { billableHours, floor, target: floor * (1 + margin / 100), projectDay: floor * 8 };
  }, [income, costs, hours, utilization, weeks, buffer]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !fieldsRef.current) return;
    gsap.fromTo(
      fieldsRef.current.children,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  useEffect(() => {
    if (resultRef.current) {
      gsap.fromTo(
        resultRef.current,
        { autoAlpha: 0.6, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [calculation]);

  return (
    <DashboardLayout>
      <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-ink">
        <section className="mx-auto grid min-h-screen max-w-[1600px] grid-flow-dense grid-cols-1 lg:grid-cols-12">
          <div className="relative border-b border-ink-line px-6 py-10 lg:col-span-7 lg:border-b-0 lg:border-r lg:px-14 lg:py-16 xl:px-20">
            <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-brass/3 blur-3xl" />
            <div className="relative max-w-3xl">
              <div className="flex items-center gap-3 text-brass">
                <Calculator className="h-6 w-6" weight="duotone" />
              </div>
              <h1 className="mt-7 max-w-5xl font-display text-4xl leading-[0.98] tracking-[-0.04em] text-cream md:text-6xl">
                Find the number that makes the work worth doing.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-text">
                Build a rate around your real financial needs, not the number that feels easiest to say out loud.
              </p>
              <div ref={fieldsRef} className="mt-12 grid gap-7 sm:grid-cols-2">
                <Field label="Annual income goal" value={income} onChange={setIncome} prefix="$" />
                <Field label="Annual business costs" value={costs} onChange={setCosts} prefix="$" />
                <Field label="Billable hours per week" value={hours} onChange={setHours} suffix="hours" />
                <Field label="Expected utilization" value={utilization} onChange={setUtilization} suffix="%" />
                <Field label="Working weeks per year" value={weeks} onChange={setWeeks} suffix="weeks" />
                <Field label="Target profit buffer" value={buffer} onChange={setBuffer} suffix="%" />
              </div>
            </div>
          </div>

          <aside className="relative bg-ink-soft/35 px-6 py-10 lg:col-span-5 lg:px-10 lg:py-16 xl:px-14">
            <div className="pointer-events-none absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-brass/5 blur-3xl" />
            <div ref={resultRef} className="sticky top-28">
              <CardStacker>
                <div data-result-card>
                  <Card className="border-brass/25 bg-brass/5">
                    <CardHeader>
                      <div className="flex items-center gap-2 text-brass">
                        <Target className="h-5 w-5" weight="duotone" />
                      </div>
                      <CardTitle className="mt-4 font-mono text-5xl text-cream">
                        <AnimatedMetric value={calculation.floor} prefix="$" />
                      </CardTitle>
                      <p className="text-sm text-slate-text">per billable hour</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs leading-relaxed text-slate-text">
                        Your rate floor covers income goals plus business costs across{" "}
                        <span className="text-cream/90">{formatHours(calculation.billableHours)}</span> billable hours per year.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div data-result-card>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2 text-brass-soft">
                        <TrendUp className="h-5 w-5" weight="duotone" />
                      </div>
                      <CardTitle className="mt-4 font-mono text-5xl text-cream">
                        <AnimatedMetric value={calculation.target} prefix="$" />
                      </CardTitle>
                      <p className="text-sm text-slate-text">per billable hour</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs leading-relaxed text-slate-text">
                        Your target rate includes a cushion for negotiation, scope creep, and the value you deliver.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div data-result-card>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2 text-sage">
                        <Clock className="h-5 w-5" weight="duotone" />
                      </div>
                      <CardTitle className="mt-4 font-mono text-4xl text-cream">
                        <AnimatedMetric value={calculation.projectDay} prefix="$" />
                      </CardTitle>
                      <p className="text-sm text-slate-text">per project day (8h)</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs leading-relaxed text-slate-text">
                        A full-day rate for quick scoping conversations and one-day engagements.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div data-result-card>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2 text-slate-text">
                        <User className="h-5 w-5" />
                      </div>
                      <CardTitle className="mt-4 font-mono text-4xl text-cream">
                        <AnimatedMetric value={calculation.billableHours} suffix="hours" />
                      </CardTitle>
                      <p className="text-sm text-slate-text">available per year</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs leading-relaxed text-slate-text">
                        Based on {hours} hours per week at {utilization}% utilization over {weeks} weeks.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardStacker>
            </div>
          </aside>
        </section>
      </main>
    </DashboardLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={prefix ? "pl-7 pr-14" : "pr-14"}
        />
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-text">
            {prefix}
          </span>
        )}
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-text">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
