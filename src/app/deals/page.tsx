import Link from "next/link";
import { BriefcaseBusiness, ArrowRight, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/guard";
import { getPrisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DealForm } from "./deal-form";

export const dynamic = "force-dynamic";

const statusLabels = {
  LEAD: "Lead",
  PROPOSAL_SENT: "Proposal sent",
  NEGOTIATING: "Negotiating",
  WON: "Won",
  LOST: "Lost",
} as const;

function money(cents: number | null, currency: string) {
  if (cents === null) return "Value not set";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default async function DealsPage() {
  const user = await requireUser();
  const deals = await getPrisma().deal.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { proposals: true, scopeChanges: true, sessions: true } } },
  });

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-ink px-6 py-10 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-6xl">
          <header className="border-b border-ink-line pb-10">
            <div className="flex items-center gap-3 text-brass"><BriefcaseBusiness className="h-5 w-5" /><span className="font-mono text-xs tracking-[0.16em]">DEAL WORKSPACE</span></div>
            <h1 className="mt-5 font-display text-4xl leading-[0.98] tracking-[-0.04em] text-cream md:text-6xl">Move good opportunities all the way to yes.</h1>
            <p className="mt-5 max-w-2xl leading-relaxed text-slate-text">Bring pricing, negotiation, scope protection, proposals, and payment terms into one private workspace for every client engagement.</p>
          </header>

          <section className="mt-10">
            <div className="mb-4 flex items-center gap-2 text-cream"><Plus className="h-5 w-5 text-brass" /><h2 className="font-display text-2xl">Open a deal</h2></div>
            <DealForm />
          </section>

          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="font-display text-2xl text-cream">Your deals</h2><p className="mt-1 text-sm text-slate-text">{deals.length} workspace{deals.length === 1 ? "" : "s"}</p></div></div>
            {deals.length === 0 ? (
              <Card className="border-dashed"><CardContent className="flex min-h-44 flex-col items-center justify-center text-center"><BriefcaseBusiness className="h-8 w-8 text-brass/60" /><p className="mt-4 text-cream">Your first deal starts with a client and an outcome.</p><p className="mt-1 text-sm text-slate-text">Create one above, then draft a proposal and protect the terms.</p></CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {deals.map((deal) => <Link key={deal.id} href={`/deals/${deal.id}`} className="group"><Card className="h-full transition-transform duration-300 group-hover:-translate-y-1 group-hover:border-brass/50"><CardHeader><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs text-brass-soft">{deal.clientName}</p><CardTitle className="mt-2">{deal.title}</CardTitle></div><Badge variant={deal.status === "WON" ? "sage" : deal.status === "LOST" ? "redline" : "default"}>{statusLabels[deal.status]}</Badge></div></CardHeader><CardContent><p className="font-mono text-lg text-cream">{money(deal.quotedValueCents, deal.currency)}</p><div className="mt-5 flex items-center justify-between text-xs text-slate-text"><span>{deal._count.proposals} proposal{deal._count.proposals === 1 ? "" : "s"} · {deal._count.scopeChanges} scope check{deal._count.scopeChanges === 1 ? "" : "s"}</span><ArrowRight className="h-4 w-4 text-brass transition-transform group-hover:translate-x-1" /></div></CardContent></Card></Link>)}
              </div>
            )}
          </section>
        </div>
      </main>
    </DashboardLayout>
  );
}
