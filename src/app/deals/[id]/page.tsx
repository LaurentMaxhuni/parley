import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guard";
import { getPrisma } from "@/lib/prisma";
import {
  NegotiationRequestSchema,
  PaymentTermsResponseSchema,
  PricingRequestSchema,
  PricingResponseSchema,
  ScopeChangeResponseSchema,
} from "@/lib/prompts";
import { DashboardLayout } from "@/components/dashboard/layout";
import { DealWorkspace } from "./deal-workspace";

export const dynamic = "force-dynamic";

function sessionLabel(type: "PRICING" | "NEGOTIATION", input: unknown) {
  if (type === "PRICING") {
    const parsed = PricingRequestSchema.safeParse(input);
    return parsed.success ? parsed.data.targetMarket : "Saved pricing session";
  }
  const parsed = NegotiationRequestSchema.safeParse(input);
  return parsed.success ? parsed.data.yourAsk : "Saved negotiation session";
}

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const prisma = getPrisma();
  const [deal, unlinkedSessions] = await Promise.all([
    prisma.deal.findFirst({
      where: { id, userId: user.id },
      include: {
        sessions: { orderBy: { createdAt: "desc" }, take: 30 },
        proposals: { orderBy: { version: "desc" } },
        scopeChanges: { orderBy: { createdAt: "desc" } },
        paymentSchedules: { where: { isSelected: true }, orderBy: { updatedAt: "desc" }, take: 1 },
      },
    }),
    prisma.sessionRecord.findMany({
      where: { userId: user.id, dealId: null },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  if (!deal) notFound();

  const pricingSessions = unlinkedSessions.flatMap((session) => {
    if (session.type !== "PRICING") return [];
    const result = PricingResponseSchema.safeParse(session.output);
    if (!result.success) return [];
    return [{
      id: session.id,
      label: sessionLabel(session.type, session.input),
      tiers: result.data.tiers.map((tier) => ({ name: tier.name, price: tier.price })),
    }];
  });

  const scopeChanges = deal.scopeChanges.flatMap((scopeChange) => {
    const output = ScopeChangeResponseSchema.safeParse(scopeChange.output);
    return output.success ? [{
      id: scopeChange.id,
      request: scopeChange.request,
      approvedScope: scopeChange.approvedScope,
      status: scopeChange.status,
      output: output.data,
      createdAt: scopeChange.createdAt.toISOString(),
    }] : [];
  });

  const selected = deal.paymentSchedules[0];
  const paymentOutput = selected ? PaymentTermsResponseSchema.safeParse(selected.output) : null;
  const selectedPaymentSchedule = selected && paymentOutput?.success ? {
    id: selected.id,
    contractValueCents: selected.contractValueCents,
    currency: selected.currency,
    timeline: selected.timeline,
    riskPreference: selected.riskPreference,
    output: paymentOutput.data,
    updatedAt: selected.updatedAt.toISOString(),
  } : null;

  return (
    <DashboardLayout>
      <DealWorkspace
        deal={{
          id: deal.id,
          clientName: deal.clientName,
          title: deal.title,
          status: deal.status,
          quotedValueCents: deal.quotedValueCents,
          currency: deal.currency,
          notes: deal.notes,
        }}
        pricingSessions={pricingSessions}
        unlinkedSessions={unlinkedSessions.map((session) => ({ id: session.id, type: session.type, label: sessionLabel(session.type, session.input), createdAt: session.createdAt.toISOString() }))}
        linkedSessions={deal.sessions.map((session) => ({ id: session.id, type: session.type, label: sessionLabel(session.type, session.input), createdAt: session.createdAt.toISOString() }))}
        proposals={deal.proposals.map((proposal) => ({ id: proposal.id, version: proposal.version, tierName: proposal.tierName, tierPrice: proposal.tierPrice, scope: proposal.scope, timeline: proposal.timeline, exclusions: proposal.exclusions, content: proposal.content, updatedAt: proposal.updatedAt.toISOString() }))}
        scopeChanges={scopeChanges}
        selectedPaymentSchedule={selectedPaymentSchedule}
      />
    </DashboardLayout>
  );
}
