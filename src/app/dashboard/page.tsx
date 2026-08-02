import { requireUser } from "@/lib/auth/guard";
import { getPrisma } from "@/lib/prisma";
import type { SessionRecord } from "@prisma/client";
import { HistoryChart } from "./history-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  NegotiationRequestSchema,
  NegotiationResponseSchema,
  PricingRequestSchema,
  PricingResponseSchema,
} from "@/lib/prompts";
import { DollarSign, MessageSquare, Clock, Activity } from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/layout";

export const dynamic = "force-dynamic";

function HistoryDetails({ record }: { record: SessionRecord }) {
  if (record.type === "PRICING") {
    const input = PricingRequestSchema.safeParse(record.input);
    const output = PricingResponseSchema.safeParse(record.output);

    if (!output.success) {
      return <p className="text-sm text-slate-text">This saved result cannot be displayed.</p>;
    }

    return (
      <div className="flex flex-col gap-4">
        {input.success && (
          <p className="text-sm text-slate-text">
            <span className="text-cream/90">Offer:</span> {input.data.description}
          </p>
        )}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {output.data.tiers.map((tier) => (
            <div key={`${tier.name}-${tier.price}`} className="rounded-md border border-ink-line p-3">
              <p className="text-sm font-medium text-cream">{tier.name}</p>
              <p className="mt-1 font-mono text-sm text-brass-soft">{tier.price}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-slate-text">Positioning</p>
          <p className="text-sm text-cream/90">{output.data.positioningCopy}</p>
        </div>
        <p className="text-sm text-slate-text">{output.data.reasoning}</p>
      </div>
    );
  }

  const input = NegotiationRequestSchema.safeParse(record.input);
  const output = NegotiationResponseSchema.safeParse(record.output);

  if (!output.success) {
    return <p className="text-sm text-slate-text">This saved result cannot be displayed.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {input.success && (
        <p className="text-sm text-slate-text">
          <span className="text-cream/90">Original ask:</span> {input.data.yourAsk}
        </p>
      )}
      <div>
        <p className="mb-1 text-xs uppercase tracking-wide text-slate-text">Suggested reply</p>
        <p className="whitespace-pre-wrap text-sm text-cream/90">
          {output.data.counterMessage}
        </p>
      </div>
      <p className="text-sm text-slate-text">{output.data.reasoning}</p>
    </div>
  );
}

const statColors = {
  brass: "bg-brass/10 text-brass",
  sage: "bg-sage/10 text-sage",
  cream: "bg-cream/10 text-cream",
  "brass-soft": "bg-brass-soft/10 text-brass-soft",
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  color = "brass"
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: keyof typeof statColors;
}) {
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-xl border border-ink-line bg-ink-soft p-4 shadow-sm shadow-black/10 sm:p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${statColors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-slate-text">{label}</p>
        <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-cream">{value}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();

  const records = await getPrisma().sessionRecord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const activeDeals = await getPrisma().deal.findMany({
    where: { userId: user.id, status: { in: ["LEAD", "PROPOSAL_SENT", "NEGOTIATING"] } },
    orderBy: { updatedAt: "desc" },
    take: 3,
    include: { _count: { select: { proposals: true, scopeChanges: true } } },
  });

  const pricingCount = records.filter(r => r.type === "PRICING").length;
  const negotiationCount = records.filter(r => r.type === "NEGOTIATION").length;
  const avgScore = records
    .filter(r => r.dealHealthScore !== null)
    .reduce((acc, r) => acc + (r.dealHealthScore || 0), 0) /
    (records.filter(r => r.dealHealthScore !== null).length || 1);

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-ink">
        <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/85 px-6 py-5 backdrop-blur-lg lg:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 pl-12 lg:pl-0">
            <div>
              <h1 className="font-display text-2xl text-cream">Your History</h1>
              <p className="text-sm text-slate-text">Track your pricing and negotiation sessions</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-text">
                {records.length} session{records.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard
              icon={DollarSign}
              label="Pricing Sessions"
              value={pricingCount}
              color="brass"
            />
            <StatCard
              icon={MessageSquare}
              label="Negotiations"
              value={negotiationCount}
              color="sage"
            />
            <StatCard
              icon={Activity}
              label="Avg Deal Score"
              value={avgScore.toFixed(0)}
              color="cream"
            />
            <StatCard
              icon={Clock}
              label="This Month"
              value={records.filter(r => {
                const d = new Date(r.createdAt);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
              color="brass-soft"
            />
          </div>

          <section className="mb-8 rounded-xl border border-ink-line bg-ink-soft/35 p-5 shadow-sm shadow-black/10 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-xl text-cream">Active deals</h2><p className="mt-1 text-sm text-slate-text">The client work that needs your next move.</p></div><Link href="/deals" className="text-sm text-brass hover:text-brass-soft">Open deals →</Link></div>
            {activeDeals.length === 0 ? <p className="mt-5 text-sm text-slate-text">No active deals yet. Create a workspace to connect pricing, proposals, and terms.</p> : <div className="mt-5 grid gap-3 md:grid-cols-3">{activeDeals.map((deal) => <Link key={deal.id} href={`/deals/${deal.id}`} className="rounded-lg border border-ink-line bg-ink/30 p-4 transition-colors hover:border-brass/50"><p className="font-mono text-xs text-brass-soft">{deal.clientName}</p><p className="mt-2 text-sm text-cream">{deal.title}</p><p className="mt-3 text-xs text-slate-text">{deal._count.proposals} proposal{deal._count.proposals === 1 ? "" : "s"} · {deal._count.scopeChanges} scope check{deal._count.scopeChanges === 1 ? "" : "s"}</p></Link>)}</div>}
          </section>

          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-line px-6 py-20 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-soft">
                <DollarSign className="h-10 w-10 text-brass/50" />
              </div>
              <h2 className="font-display text-xl text-cream">No sessions yet</h2>
              <p className="mt-2 max-w-md text-slate-text">
                Run the Pricing Advisor or the Negotiation Counter-Generator
                and your results will show up here.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/pricing" className="rounded-md bg-brass px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-brass-soft">Open Pricing Advisor</Link>
                <Link href="/negotiate" className="rounded-md border border-ink-line px-4 py-2 text-sm font-medium text-slate-text transition-colors hover:bg-ink-soft hover:text-cream">Draft a counter</Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <HistoryChart records={records} />

              <div className="flex flex-col gap-3">
                {records.map((r) => (
                  <Card key={r.id}>
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          {r.type === "PRICING" ? (
                            <DollarSign className="h-5 w-5 text-brass" />
                          ) : (
                            <MessageSquare className="h-5 w-5 text-sage" />
                          )}
                          <CardTitle className="text-base">
                            {r.type === "PRICING" ? "Pricing session" : "Negotiation session"}
                          </CardTitle>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {r.dealHealthScore !== null && (
                            <Badge
                              variant={
                                r.dealHealthScore >= 67
                                  ? "sage"
                                  : r.dealHealthScore >= 34
                                  ? "default"
                                  : "redline"
                              }
                            >
                              {r.dealHealthScore}
                            </Badge>
                          )}
                          <Badge>{r.modelUsed}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <p className="text-xs text-slate-text flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                      <HistoryDetails record={r} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
