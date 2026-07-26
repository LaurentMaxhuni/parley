"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight, Calculator, CheckCircle, TrendUp } from "@phosphor-icons/react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function asNumber(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default function CalculatorPage() {
  const [income, setIncome] = useState("90000");
  const [costs, setCosts] = useState("18000");
  const [hours, setHours] = useState("20");
  const [utilization, setUtilization] = useState("70");
  const [weeks, setWeeks] = useState("46");
  const [buffer, setBuffer] = useState("25");
  const resultRef = useRef<HTMLDivElement>(null);

  const calculation = useMemo(() => {
    const annualIncome = asNumber(income); const annualCosts = asNumber(costs); const weeklyHours = asNumber(hours); const rate = Math.min(100, asNumber(utilization)); const workWeeks = asNumber(weeks); const margin = asNumber(buffer);
    const billableHours = weeklyHours * workWeeks * (rate / 100);
    const floor = billableHours > 0 ? (annualIncome + annualCosts) / billableHours : 0;
    return { billableHours, floor, target: floor * (1 + margin / 100), projectDay: floor * 8 };
  }, [income, costs, hours, utilization, weeks, buffer]);

  useEffect(() => { if (resultRef.current) gsap.fromTo(resultRef.current, { autoAlpha: 0.5, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }); }, [calculation.floor, calculation.target]);

  return <DashboardLayout><main className="min-h-screen w-full max-w-full overflow-x-hidden bg-ink"><section className="mx-auto grid min-h-screen max-w-[1600px] grid-flow-dense grid-cols-1 lg:grid-cols-12"><div className="border-b border-ink-line px-6 py-10 lg:col-span-7 lg:border-b-0 lg:border-r lg:px-10 lg:py-14 xl:px-14"><div className="max-w-3xl"><div className="flex items-center gap-3 text-brass"><Calculator className="h-6 w-6" weight="duotone" /><span className="font-mono text-xs tracking-[0.16em]">RATE CALCULATOR</span></div><h1 className="mt-7 max-w-5xl font-display text-4xl leading-[0.98] tracking-[-0.04em] text-cream md:text-6xl">Find the number that makes the work worth doing.</h1><p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-text">Build a rate around your real financial needs, not the number that feels easiest to say out loud.</p><div className="mt-12 grid gap-7 sm:grid-cols-2"><Field label="Annual income goal" value={income} onChange={setIncome} prefix="$" /><Field label="Annual business costs" value={costs} onChange={setCosts} prefix="$" /><Field label="Billable hours per week" value={hours} onChange={setHours} suffix="hours" /><Field label="Expected utilization" value={utilization} onChange={setUtilization} suffix="%" /><Field label="Working weeks per year" value={weeks} onChange={setWeeks} suffix="weeks" /><Field label="Target profit buffer" value={buffer} onChange={setBuffer} suffix="%" /></div></div></div><aside className="bg-ink-soft/35 px-6 py-10 lg:col-span-5 lg:px-8 lg:py-14 xl:px-10"><div ref={resultRef} className="sticky top-28 space-y-5"><Card className="border-brass/25 bg-brass/5"><CardHeader><div className="flex items-center gap-2 text-brass"><TrendUp className="h-5 w-5" /><span className="font-mono text-xs">YOUR RATE FLOOR</span></div><CardTitle className="mt-5 font-mono text-5xl text-cream">{currency(calculation.floor)}</CardTitle><p className="text-sm text-slate-text">per billable hour</p></CardHeader><CardContent className="border-t border-brass/20 pt-5 text-sm leading-relaxed text-slate-text">Below this, you are paying to do the work. This accounts for your income goal, costs, and realistic billable capacity.</CardContent></Card><div className="grid gap-4 sm:grid-cols-2"><Metric title="Target rate" value={currency(calculation.target)} detail={`Includes ${buffer || 0}% buffer`} /><Metric title="Day rate floor" value={currency(calculation.projectDay)} detail="Based on 8 billable hours" /></div><Card><CardHeader><CardTitle>Capacity check</CardTitle></CardHeader><CardContent className="flex gap-3 text-sm leading-relaxed text-slate-text"><CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-sage" />At your assumptions, you have roughly {Math.round(calculation.billableHours).toLocaleString()} billable hours to sell each year.</CardContent></Card><Button asChild size="lg" className="w-full"><Link href="/pricing">Use this in Pricing Advisor <ArrowRight className="h-4 w-4" /></Link></Button></div></aside></section></main></DashboardLayout>;
}

function Field({ label, value, onChange, prefix, suffix }: { label: string; value: string; onChange: (value: string) => void; prefix?: string; suffix?: string }) {
  return <div className="flex flex-col gap-2"><Label>{label}</Label><div className="relative"><Input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className={prefix ? "pl-7 pr-14" : "pr-14"} />{prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-text">{prefix}</span>}{suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-text">{suffix}</span>}</div></div>;
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) { return <Card className="p-5"><p className="text-xs text-slate-text">{title}</p><p className="mt-3 font-mono text-2xl text-brass-soft">{value}</p><p className="mt-2 text-xs text-slate-text">{detail}</p></Card>; }
