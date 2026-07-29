"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calculator,
  CheckCircle,
  Clock,
  Info,
  TrendUp,
  Wallet,
} from "@phosphor-icons/react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function asNumber(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function CalculatorPage() {
  const [income, setIncome] = useState("90000");
  const [costs, setCosts] = useState("18000");
  const [hours, setHours] = useState("40");
  const [utilization, setUtilization] = useState("60");
  const [weeks, setWeeks] = useState("46");
  const [buffer, setBuffer] = useState("25");

  const calculation = useMemo(() => {
    const annualIncome = asNumber(income);
    const annualCosts = asNumber(costs);
    const weeklyHours = clamp(asNumber(hours), 0, 168);
    const billableShare = clamp(asNumber(utilization), 0, 100);
    const workWeeks = clamp(asNumber(weeks), 0, 52);
    const cushion = clamp(asNumber(buffer), 0, 200);
    const billableHours = weeklyHours * workWeeks * (billableShare / 100);
    const weeklyBillableHours = weeklyHours * (billableShare / 100);
    const revenueNeeded = annualIncome + annualCosts;
    const floor = billableHours > 0 ? revenueNeeded / billableHours : 0;
    const target = floor * (1 + cushion / 100);

    return {
      annualCosts,
      annualIncome,
      billableHours,
      billableShare,
      cushion,
      floor,
      revenueNeeded,
      target,
      dayRate: target * 8,
      weeklyBillableHours,
      weeklyHours,
      workWeeks,
    };
  }, [income, costs, hours, utilization, weeks, buffer]);

  const hasUsableResult =
    calculation.revenueNeeded > 0 && calculation.billableHours > 0;

  return (
    <DashboardLayout>
      <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-ink">
        <section className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-12">
          <div className="border-b border-ink-line px-6 pb-14 pt-10 lg:col-span-7 lg:border-b-0 lg:border-r lg:px-10 lg:pb-20 lg:pt-14 xl:px-14">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 pl-9 text-brass lg:pl-0">
                <Calculator className="h-6 w-6" weight="duotone" />
                <span className="font-mono text-xs tracking-[0.16em]">
                  RATE CALCULATOR
                </span>
              </div>
              <h1 className="mt-7 max-w-2xl text-balance font-display text-4xl leading-[0.98] tracking-[-0.04em] text-cream md:text-6xl">
                Know what an hour needs to earn.
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-slate-text">
                Start with what the business must cover, then divide it by
                the hours you can realistically invoice. We will show every
                step of the math.
              </p>
              <p className="mt-4 flex max-w-xl gap-2 text-sm leading-relaxed text-brass-soft">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                Example numbers are filled in. Replace them with yours and the
                result updates instantly.
              </p>

              <div className="mt-12 space-y-12">
                <CalculatorSection
                  number="1"
                  icon={Wallet}
                  title="What must the business pay for?"
                  description="Your rate first needs to cover your pay and the cost of keeping the business running."
                >
                  <div className="grid gap-7 sm:grid-cols-2">
                    <Field
                      id="income"
                      label="Your annual pay goal"
                      hint="What you want to pay yourself before personal tax."
                      value={income}
                      onChange={setIncome}
                      prefix="$"
                      suffix="/ year"
                    />
                    <Field
                      id="costs"
                      label="Annual business costs"
                      hint="Software, insurance, equipment, help, and overhead."
                      value={costs}
                      onChange={setCosts}
                      prefix="$"
                      suffix="/ year"
                    />
                  </div>
                </CalculatorSection>

                <CalculatorSection
                  number="2"
                  icon={Clock}
                  title="How much time can you actually sell?"
                  description="Not every working hour reaches an invoice. Leave room for sales, admin, planning, and gaps between projects."
                >
                  <div className="grid gap-7 sm:grid-cols-2">
                    <Field
                      id="hours"
                      label="Hours you work each week"
                      hint="Include both client work and running the business."
                      value={hours}
                      onChange={setHours}
                      suffix="hours"
                    />
                    <Field
                      id="weeks"
                      label="Weeks you work each year"
                      hint="Start with 52, then subtract time off."
                      value={weeks}
                      onChange={setWeeks}
                      suffix="weeks"
                    />
                  </div>

                  <BillableTimeSlider
                    value={calculation.billableShare}
                    weeklyBillableHours={calculation.weeklyBillableHours}
                    onChange={setUtilization}
                  />
                </CalculatorSection>

                <CalculatorSection
                  number="3"
                  icon={TrendUp}
                  title="Add some breathing room"
                  description="Your break-even rate keeps the plan afloat. A cushion gives you room for slow months, scope surprises, and growth."
                >
                  <div className="max-w-sm">
                    <Field
                      id="buffer"
                      label="Cushion above your floor"
                      hint="If you are unsure, 20–30% is a practical starting point."
                      value={buffer}
                      onChange={setBuffer}
                      suffix="%"
                    />
                  </div>
                </CalculatorSection>
              </div>
            </div>
          </div>

          <aside className="bg-ink-soft/35 px-6 py-10 lg:col-span-5 lg:px-8 lg:py-14 xl:px-10">
            <div className="sticky top-8 space-y-5 lg:top-14">
              <section className="overflow-hidden rounded-2xl border border-brass/30 bg-brass/[0.07]">
                <div className="border-b border-brass/20 px-6 pb-7 pt-6 sm:px-7">
                  <div className="flex items-center gap-2 text-brass">
                    <TrendUp className="h-5 w-5" weight="duotone" />
                    <h2 className="font-mono text-xs uppercase tracking-[0.12em]">
                      Recommended starting rate
                    </h2>
                  </div>
                  <div
                    className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <p className="font-mono text-5xl tabular-nums tracking-[-0.06em] text-cream sm:text-6xl">
                      {hasUsableResult ? currency(calculation.target) : "—"}
                    </p>
                    <p className="pb-2 text-sm text-slate-text">per hour</p>
                  </div>
                  <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-text">
                    Quote this first. It covers the pay and costs you entered,
                    then adds your {calculation.cushion}% breathing room.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2">
                  <ResultMetric
                    label="Your hard floor"
                    value={hasUsableResult ? `${currency(calculation.floor)}/hr` : "—"}
                    detail="The lowest rate that covers the plan."
                  />
                  <ResultMetric
                    label="Equivalent day rate"
                    value={hasUsableResult ? currency(calculation.dayRate) : "—"}
                    detail="8 × your recommended hourly rate."
                    className="border-t border-brass/20 sm:border-l sm:border-t-0"
                  />
                </div>
              </section>

              <section className="rounded-xl border border-ink-line bg-ink-soft/55 p-6 sm:p-7">
                <h2 className="font-display text-2xl text-cream">
                  How we got there
                </h2>
                <ol className="mt-6 space-y-0">
                  <MathStep
                    number="1"
                    label="Revenue to cover each year"
                    value={currency(calculation.revenueNeeded)}
                    detail={`${compactCurrency(calculation.annualIncome)} for you + ${compactCurrency(calculation.annualCosts)} in business costs`}
                  />
                  <MathStep
                    number="2"
                    label="Hours you can invoice each year"
                    value={Math.round(calculation.billableHours).toLocaleString()}
                    detail={`${calculation.weeklyHours} hrs × ${calculation.workWeeks} weeks × ${calculation.billableShare}% billable`}
                  />
                  <MathStep
                    number="3"
                    label="Break-even hourly rate"
                    value={hasUsableResult ? currency(calculation.floor) : "—"}
                    detail={
                      hasUsableResult
                        ? `${compactCurrency(calculation.revenueNeeded)} ÷ ${Math.round(calculation.billableHours).toLocaleString()} billable hours`
                        : "Add working time above to calculate your floor."
                    }
                    last
                  />
                </ol>
                <div className="mt-5 flex items-start gap-3 rounded-lg bg-ink px-4 py-3.5">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
                  <p className="text-sm leading-relaxed text-slate-text">
                    Add {calculation.cushion}% breathing room to the floor and
                    your starting quote becomes{" "}
                    <strong className="font-mono font-medium text-cream">
                      {hasUsableResult
                        ? `${currency(calculation.target)}/hr`
                        : "—"}
                    </strong>
                    .
                  </p>
                </div>
              </section>

              <section className="rounded-xl border border-ink-line bg-ink/40 p-5">
                <h2 className="text-sm font-medium text-cream">
                  What this number does—and does not—tell you
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-text">
                  This is the rate your business needs, not a verdict on what a
                  specific project is worth. Use the Pricing Advisor to account
                  for scope, risk, and client value.
                </p>
              </section>

              <Button asChild size="lg" className="w-full">
                <Link href="/pricing">
                  Price a specific project
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </aside>
        </section>
      </main>
    </DashboardLayout>
  );
}

function CalculatorSection({
  number,
  icon: Icon,
  title,
  description,
  children,
}: {
  number: string;
  icon: typeof Wallet;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`calculator-step-${number}`}>
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brass/25 bg-brass/[0.08] text-brass">
          <Icon className="h-5 w-5" weight="duotone" />
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.14em] text-brass">
            STEP {number}
          </p>
          <h2
            id={`calculator-step-${number}`}
            className="mt-1 font-display text-2xl text-cream"
          >
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-text">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-6 border-l border-ink-line pl-6 sm:ml-5 sm:pl-9">
        {children}
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-medium text-cream">
        {label}
      </Label>
      <p id={hintId} className="min-h-10 text-xs leading-relaxed text-slate-text">
        {hint}
      </p>
      <div className="relative">
        <Input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          aria-describedby={hintId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-12 font-mono text-base tabular-nums ${
            prefix ? "pl-8" : ""
          } ${suffix ? "pr-20" : ""}`}
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

function BillableTimeSlider({
  value,
  weeklyBillableHours,
  onChange,
}: {
  value: number;
  weeklyBillableHours: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-8 rounded-xl border border-ink-line bg-ink-soft/45 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <Label htmlFor="utilization" className="text-sm font-medium text-cream">
            How much of your week can you invoice?
          </Label>
          <p
            id="utilization-hint"
            className="mt-2 max-w-lg text-xs leading-relaxed text-slate-text"
          >
            Billable time is client work you can put on an invoice. If you are
            unsure, 60% leaves the rest for sales and admin.
          </p>
        </div>
        <output
          htmlFor="utilization"
          className="shrink-0 font-mono text-2xl tabular-nums text-brass-soft"
        >
          {value}%
        </output>
      </div>
      <input
        id="utilization"
        type="range"
        min="20"
        max="100"
        step="5"
        value={value}
        aria-describedby="utilization-hint utilization-result"
        onChange={(event) => onChange(event.target.value)}
        className="mt-5 h-2 w-full cursor-pointer accent-brass"
      />
      <div
        aria-hidden="true"
        className="mt-2 flex justify-between text-[11px] text-slate-text"
      >
        <span>More time on admin</span>
        <span>Mostly client work</span>
      </div>
      <p
        id="utilization-result"
        className="mt-4 border-t border-ink-line pt-4 text-sm text-cream/90"
      >
        That gives you about{" "}
        <strong className="font-mono font-medium text-brass-soft">
          {weeklyBillableHours.toFixed(1)} billable hours
        </strong>{" "}
        per week.
      </p>
    </div>
  );
}

function ResultMetric({
  label,
  value,
  detail,
  className = "",
}: {
  label: string;
  value: string;
  detail: string;
  className?: string;
}) {
  return (
    <div className={`p-6 sm:p-7 ${className}`}>
      <p className="text-xs text-slate-text">{label}</p>
      <p className="mt-2 font-mono text-2xl tabular-nums text-brass-soft">
        {value}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-text">{detail}</p>
    </div>
  );
}

function MathStep({
  number,
  label,
  value,
  detail,
  last = false,
}: {
  number: string;
  label: string;
  value: string;
  detail: string;
  last?: boolean;
}) {
  return (
    <li className="grid grid-cols-[2rem_minmax(0,1fr)_auto] gap-x-3">
      <div className="relative flex justify-center">
        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-ink-line bg-ink font-mono text-xs text-brass">
          {number}
        </span>
        {!last && (
          <span className="absolute bottom-0 top-8 w-px bg-ink-line" />
        )}
      </div>
      <div className={last ? "pb-0" : "pb-6"}>
        <p className="text-sm font-medium text-cream">{label}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-text">{detail}</p>
      </div>
      <p className="font-mono text-sm tabular-nums text-brass-soft">{value}</p>
    </li>
  );
}
