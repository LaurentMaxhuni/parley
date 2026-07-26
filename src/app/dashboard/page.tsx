import { requireUser } from "@/lib/auth/guard";
import { getPrisma } from "@/lib/prisma";
import type { SessionRecord } from "@prisma/client";
import { Nav } from "@/components/nav";
import { HistoryChart } from "./history-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  NegotiationRequestSchema,
  NegotiationResponseSchema,
  PricingRequestSchema,
  PricingResponseSchema,
} from "@/lib/prompts";

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

export default async function DashboardPage() {
  const user = await requireUser();

  const records = await getPrisma().sessionRecord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-ink">
      <Nav signedIn />
      <main className="mx-auto max-w-3xl px-6 py-12 md:px-10">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-brass">
          Dashboard
        </p>
        <h1 className="mb-8 font-display text-3xl text-cream">Your history</h1>

        {records.length === 0 ? (
          <p className="text-sm text-slate-text">
            Nothing here yet — run the Pricing Advisor or the Negotiation
            Counter-Generator and it&apos;ll show up here.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            <HistoryChart records={records} />

            <div className="flex flex-col gap-3">
              {records.map((r) => (
                <Card key={r.id}>
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <CardTitle className="text-base">
                        {r.type === "PRICING" ? "Pricing session" : "Negotiation session"}
                      </CardTitle>
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
                    <p className="text-xs text-slate-text">
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                    <HistoryDetails record={r} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
