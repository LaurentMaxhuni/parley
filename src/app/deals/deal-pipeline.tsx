"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CalendarDots, CheckCircle, WarningCircle, XCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

type DealStatus = "LEAD" | "PROPOSAL_SENT" | "NEGOTIATING" | "WON" | "LOST";

type PipelineDeal = {
  id: string;
  clientName: string;
  title: string;
  status: DealStatus;
  quotedValueCents: number | null;
  currency: string;
  targetCloseDate: string | null;
  proposalCount: number;
  scopeChangeCount: number;
};

type Stage = {
  id: "LEAD" | "PROPOSAL_SENT" | "NEGOTIATING" | "CLOSED";
  label: string;
  description: string;
  statuses: DealStatus[];
  tone: string;
};

const stages: Stage[] = [
  { id: "LEAD", label: "Qualified", description: "Work worth pursuing", statuses: ["LEAD"], tone: "text-brass" },
  { id: "PROPOSAL_SENT", label: "Proposal out", description: "Waiting for a response", statuses: ["PROPOSAL_SENT"], tone: "text-brass-soft" },
  { id: "NEGOTIATING", label: "In conversation", description: "Terms are moving", statuses: ["NEGOTIATING"], tone: "text-sage" },
  { id: "CLOSED", label: "Closed", description: "Won or released", statuses: ["WON", "LOST"], tone: "text-slate-text" },
];

const statusLabels: Record<DealStatus, string> = {
  LEAD: "Qualified",
  PROPOSAL_SENT: "Proposal sent",
  NEGOTIATING: "Negotiating",
  WON: "Won",
  LOST: "Lost",
};

function money(cents: number | null, currency: string) {
  if (cents === null) return "Value not set";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

function statusIcon(status: DealStatus) {
  if (status === "WON") return <CheckCircle className="h-3.5 w-3.5 text-sage" weight="fill" />;
  if (status === "LOST") return <XCircle className="h-3.5 w-3.5 text-redline" weight="fill" />;
  if (status === "NEGOTIATING") return <WarningCircle className="h-3.5 w-3.5 text-sage" weight="fill" />;
  return null;
}

export function DealPipeline({ deals: initialDeals }: { deals: PipelineDeal[] }) {
  const router = useRouter();
  const [deals, setDeals] = useState(initialDeals);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setDeals(initialDeals), [initialDeals]);

  async function moveDeal(id: string, status: DealStatus) {
    const previous = deals.find((deal) => deal.id === id)?.status;
    if (!previous || previous === status) return;

    setError(null);
    setSavingId(id);
    setDeals((current) => current.map((deal) => (deal.id === id ? { ...deal, status } : deal)));

    try {
      const response = await fetch(`/api/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error();
      router.refresh();
    } catch {
      setDeals((current) => current.map((deal) => (deal.id === id ? { ...deal, status: previous } : deal)));
      setError("The deal stage could not be saved. Please try again.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section aria-labelledby="pipeline-heading">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.15em] text-brass">PIPELINE VIEW</p>
          <h2 id="pipeline-heading" className="mt-2 font-display text-2xl text-cream">Move each opportunity forward.</h2>
        </div>
        <p className="text-sm text-slate-text">Use the stage picker on any deal to keep the board current.</p>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-redline">{error}</p>}

      <div className="grid grid-flow-col auto-cols-[minmax(15.5rem,1fr)] gap-4 overflow-x-auto pb-2 xl:grid-flow-row xl:grid-cols-4 xl:overflow-visible">
        {stages.map((stage) => {
          const stageDeals = deals.filter((deal) => stage.statuses.includes(deal.status));
          return (
            <section key={stage.id} className="min-h-[21rem] rounded-xl border border-ink-line bg-ink-soft/35 p-3">
              <header className="flex items-start justify-between gap-3 border-b border-ink-line px-1 pb-3">
                <div>
                  <h3 className={`font-display text-lg ${stage.tone}`}>{stage.label}</h3>
                  <p className="mt-1 text-xs text-slate-text">{stage.description}</p>
                </div>
                <span className="font-mono text-xs text-slate-text">{stageDeals.length}</span>
              </header>

              <div className="mt-3 space-y-3">
                {stageDeals.length === 0 ? (
                  <p className="px-1 py-5 text-xs leading-relaxed text-slate-text">Nothing here yet.</p>
                ) : (
                  stageDeals.map((deal) => (
                    <article key={deal.id} className="rounded-lg border border-ink-line bg-ink/55 p-3 transition-colors hover:border-brass/35">
                      <Link href={`/deals/${deal.id}`} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60">
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 truncate font-mono text-xs text-brass-soft">{deal.clientName}</p>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-text transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brass" />
                        </div>
                        <h4 className="mt-2 break-words text-sm font-medium leading-snug text-cream">{deal.title}</h4>
                        <p className="mt-3 font-mono text-sm text-cream">{money(deal.quotedValueCents, deal.currency)}</p>
                      </Link>

                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink-line pt-3 text-xs text-slate-text">
                        <span className="flex min-w-0 items-center gap-1.5 truncate">
                          {deal.targetCloseDate ? <CalendarDots className="h-3.5 w-3.5 shrink-0 text-brass" /> : null}
                          {deal.targetCloseDate ? `Close ${deal.targetCloseDate.slice(0, 10)}` : `${deal.proposalCount} proposal${deal.proposalCount === 1 ? "" : "s"}`}
                        </span>
                        {statusIcon(deal.status)}
                      </div>

                      <label className="sr-only" htmlFor={`stage-${deal.id}`}>Move {deal.title} to a pipeline stage</label>
                      <select
                        id={`stage-${deal.id}`}
                        value={deal.status}
                        disabled={savingId === deal.id}
                        onChange={(event) => moveDeal(deal.id, event.target.value as DealStatus)}
                        className="mt-3 h-8 w-full rounded-md border border-ink-line bg-ink-soft px-2 text-xs text-cream transition-colors hover:border-brass/40 disabled:cursor-wait"
                      >
                        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </article>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-text">
        <span>{deals.filter((deal) => deal.scopeChangeCount > 0).length} deal{deals.filter((deal) => deal.scopeChangeCount > 0).length === 1 ? "" : "s"} with scope decisions</span>
        <Button asChild variant="ghost" size="sm" className="shrink-0 text-brass hover:text-brass-soft"><Link href="/dashboard">See deal activity</Link></Button>
      </div>
    </section>
  );
}
