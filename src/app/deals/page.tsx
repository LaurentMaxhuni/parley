import { BriefcaseBusiness, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/guard";
import { getPrisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DealForm } from "./deal-form";
import { DealPipeline } from "./deal-pipeline";

export const dynamic = "force-dynamic";

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default async function DealsPage() {
  const user = await requireUser();
  const deals = await getPrisma().deal.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { proposals: true, scopeChanges: true } } },
  });
  const activeDeals = deals.filter((deal) => !["WON", "LOST"].includes(deal.status));
  const activeValues = activeDeals.reduce<Map<string, number>>((totals, deal) => {
    totals.set(deal.currency, (totals.get(deal.currency) ?? 0) + (deal.quotedValueCents ?? 0));
    return totals;
  }, new Map());
  const activeValueLabel = activeValues.size === 0
    ? "No value set"
    : Array.from(activeValues, ([currency, cents]) => money(cents, currency)).join(" + ");

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-ink px-6 py-10 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-6xl">
          <header className="border-b border-ink-line pb-10">
            <div className="flex items-center gap-3 text-brass"><BriefcaseBusiness className="h-5 w-5" /><span className="font-mono text-xs tracking-[0.16em]">DEAL WORKSPACE</span></div>
            <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[0.98] tracking-[-0.04em] text-cream md:text-6xl">Move good opportunities all the way to yes.</h1>
            <p className="mt-5 max-w-2xl leading-relaxed text-slate-text">Bring pricing, negotiation, scope protection, proposals, and payment terms into one private workspace for every client engagement.</p>
          </header>

          <section id="open-deal" className="mt-10 scroll-mt-6">
            <div className="mb-4 flex items-center gap-2 text-cream"><Plus className="h-5 w-5 text-brass" /><h2 className="font-display text-2xl">Open a deal</h2></div>
            <DealForm />
          </section>

          <section className="mt-12 grid gap-4 sm:grid-cols-[1.15fr_0.85fr] lg:grid-cols-3">
            <Card className="border-brass/25 bg-brass/5"><CardHeader><CardTitle className="text-base">Open opportunities</CardTitle></CardHeader><CardContent className="font-mono text-2xl text-cream">{activeDeals.length}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Active pipeline value</CardTitle></CardHeader><CardContent className="font-mono text-2xl text-cream">{activeValueLabel}</CardContent></Card>
            <Card className="sm:col-span-2 lg:col-span-1"><CardHeader><CardTitle className="text-base">Workspaces</CardTitle></CardHeader><CardContent className="font-mono text-2xl text-cream">{deals.length}</CardContent></Card>
          </section>

          <section className="mt-10">
            {deals.length === 0 ? (
              <Card className="border-dashed"><CardContent className="flex min-h-44 flex-col items-center justify-center text-center"><BriefcaseBusiness className="h-8 w-8 text-brass/60" /><p className="mt-4 text-cream">Your first deal starts with a client and an outcome.</p><p className="mt-1 text-sm text-slate-text">Create one above, then draft a proposal and protect the terms.</p></CardContent></Card>
            ) : (
              <DealPipeline deals={deals.map((deal) => ({
                id: deal.id,
                clientName: deal.clientName,
                title: deal.title,
                status: deal.status,
                quotedValueCents: deal.quotedValueCents,
                currency: deal.currency,
                targetCloseDate: deal.targetCloseDate?.toISOString() ?? null,
                proposalCount: deal._count.proposals,
                scopeChangeCount: deal._count.scopeChanges,
              }))} />
            )}
          </section>
        </div>
      </main>
    </DashboardLayout>
  );
}
