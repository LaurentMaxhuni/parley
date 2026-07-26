import Link from "next/link";
import { ArrowRight, BookOpen, DollarSign, MessageSquare } from "lucide-react";
import { requireUser } from "@/lib/auth/guard";
import { getPrisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  NegotiationRequestSchema,
  NegotiationResponseSchema,
  PricingRequestSchema,
  PricingResponseSchema,
} from "@/lib/prompts";

export const dynamic = "force-dynamic";

export default async function PlaybookPage() {
  const user = await requireUser();
  const records = await getPrisma().sessionRecord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return (
    <DashboardLayout>
      <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-ink px-6 py-10 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-6xl">
          <header className="border-b border-ink-line pb-10 md:pb-14">
            <div className="flex items-center gap-3 text-brass">
              <BookOpen className="h-5 w-5" />
              <span className="font-mono text-xs tracking-[0.16em]">YOUR PLAYBOOK</span>
            </div>
            <h1 className="mt-5 max-w-5xl font-display text-4xl leading-[0.98] tracking-[-0.04em] text-cream md:text-6xl">Turn each decision into an advantage you can reuse.</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-text">Your strongest prices, negotiation calls, and ready-to-send language—kept in one place for the next opportunity.</p>
          </header>

          {records.length === 0 ? <EmptyPlaybook /> : (
            <div className="mt-10 grid grid-flow-dense gap-4 md:grid-cols-2">
              {records.map((record) => record.type === "PRICING" ? <PricingEntry key={record.id} input={record.input} output={record.output} date={record.createdAt} /> : <NegotiationEntry key={record.id} input={record.input} output={record.output} date={record.createdAt} score={record.dealHealthScore} />)}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}

function PricingEntry({ input, output, date }: { input: unknown; output: unknown; date: Date }) {
  const request = PricingRequestSchema.safeParse(input);
  const result = PricingResponseSchema.safeParse(output);
  if (!result.success) return null;
  return <Card className="group overflow-hidden p-0 transition-transform duration-500 hover:-translate-y-1"><CardHeader className="border-b border-ink-line p-6"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-brass"><DollarSign className="h-4 w-4" /><span className="font-mono text-xs">PRICING MOVE</span></div><CardTitle className="mt-4">{request.success ? request.data.targetMarket : "Saved pricing strategy"}</CardTitle></div><time className="text-xs text-slate-text">{date.toLocaleDateString()}</time></div></CardHeader><CardContent className="p-6"><p className="line-clamp-3 text-sm leading-relaxed text-slate-text">{request.success ? request.data.description : result.data.positioningCopy}</p><div className="mt-6 grid grid-cols-3 gap-2">{result.data.tiers.slice(0, 3).map((tier) => <div key={`${tier.name}-${tier.price}`} className="rounded-lg border border-ink-line bg-ink/30 p-3"><p className="truncate text-xs text-slate-text">{tier.name}</p><p className="mt-1 font-mono text-sm text-brass-soft">{tier.price}</p></div>)}</div></CardContent></Card>;
}

function NegotiationEntry({ input, output, date, score }: { input: unknown; output: unknown; date: Date; score: number | null }) {
  const request = NegotiationRequestSchema.safeParse(input);
  const result = NegotiationResponseSchema.safeParse(output);
  if (!result.success) return null;
  return <Card className="group overflow-hidden p-0 transition-transform duration-500 hover:-translate-y-1"><CardHeader className="border-b border-ink-line p-6"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-sage"><MessageSquare className="h-4 w-4" /><span className="font-mono text-xs">NEGOTIATION MOVE</span></div><CardTitle className="mt-4">{result.data.verdict.replace("_", " ")}</CardTitle></div><div className="text-right"><p className="font-mono text-lg text-brass-soft">{score ?? "—"}</p><time className="text-xs text-slate-text">{date.toLocaleDateString()}</time></div></div></CardHeader><CardContent className="p-6"><p className="line-clamp-2 text-sm leading-relaxed text-slate-text">{request.success ? request.data.clientMessage : result.data.reasoning}</p><p className="mt-5 border-l-2 border-brass/50 pl-4 text-sm leading-relaxed text-cream/90">{result.data.counterMessage}</p></CardContent></Card>;
}

function EmptyPlaybook() {
  return <div className="mt-10 grid gap-4 md:grid-cols-2"><Card className="min-h-72 border-brass/25 bg-brass/5"><CardHeader><BookOpen className="h-7 w-7 text-brass" /><CardTitle className="mt-8">Your strongest moves will collect here.</CardTitle></CardHeader><CardContent className="text-sm leading-relaxed text-slate-text">Run a pricing review or a negotiation and Parley will turn the result into a reusable reference.</CardContent></Card><div className="flex min-h-72 flex-col justify-end rounded-xl border border-ink-line bg-ink-soft/40 p-6"><Button asChild className="w-full"><Link href="/pricing">Create a pricing move <ArrowRight className="h-4 w-4" /></Link></Button><Button asChild variant="outline" className="mt-3 w-full"><Link href="/negotiate">Create a negotiation move <ArrowRight className="h-4 w-4" /></Link></Button></div></div>;
}
