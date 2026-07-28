import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuth } from "@/lib/auth/server";
import { getPrisma } from "@/lib/prisma";
import { reserveGeneration } from "@/lib/generation-rate-limit";
import { ConfigurationError } from "@/lib/env";
import { selectModel, callOpenRouter, modelsForTier } from "@/lib/openrouter";
import { extractJson } from "@/lib/extract-json";
import {
  PricingRequestSchema,
  PricingResponseSchema,
  NegotiationRequestSchema,
  NegotiationResponseSchema,
  TradeoffRequestSchema,
  TradeoffResponseSchema,
  ProposalRequestSchema,
  ProposalResponseSchema,
  ScopeChangeRequestSchema,
  ScopeChangeResponseSchema,
  PaymentTermsRequestSchema,
  PaymentTermsResponseSchema,
  buildPricingPrompt,
  buildNegotiationPrompt,
  buildTradeoffPrompt,
  buildProposalPrompt,
  buildScopeChangePrompt,
  buildPaymentTermsPrompt,
} from "@/lib/prompts";

const BodySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("pricing"), payload: PricingRequestSchema }),
  z.object({ type: z.literal("negotiation"), payload: NegotiationRequestSchema }),
  z.object({ type: z.literal("tradeoff"), payload: TradeoffRequestSchema }),
  z.object({ type: z.literal("proposal"), payload: ProposalRequestSchema }),
  z.object({ type: z.literal("scope_change"), payload: ScopeChangeRequestSchema }),
  z.object({ type: z.literal("payment_terms"), payload: PaymentTermsRequestSchema }),
]);

function authenticationError(error: unknown) {
  if (error instanceof ConfigurationError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  console.error("Authentication failed:", error);
  return NextResponse.json(
    { error: "The authentication service is unavailable. Try again shortly." },
    { status: 503 }
  );
}

export async function POST(req: NextRequest) {
  let userId: string;

  try {
    const { data: session } = await getAuth().getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    userId = session.user.id;
  } catch (error) {
    return authenticationError(error);
  }

  const body = await req.json().catch(() => null);
  const parsedBody = BodySchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid input.", details: parsedBody.error.flatten() },
      { status: 400 }
    );
  }

  const { type, payload } = parsedBody.data;

  // Deal-linked generators may only read/write a deal that belongs to the
  // signed-in user. The opaque CUID is never enough authorization by itself.
  const dealId = "dealId" in payload ? payload.dealId : null;
  let deal: { id: string; clientName: string; title: string } | null = null;
  if (dealId) {
    try {
      deal = await getPrisma().deal.findFirst({
        where: { id: dealId, userId },
        select: { id: true, clientName: true, title: true },
      });
    } catch (error) {
      console.error("Failed to load deal:", error);
      return NextResponse.json({ error: "Deals are temporarily unavailable." }, { status: 503 });
    }

    if (!deal) {
      return NextResponse.json({ error: "Deal not found." }, { status: 404 });
    }
  }

  if (type === "proposal" && payload.pricingSessionId) {
    const pricingSession = await getPrisma().sessionRecord.findFirst({
      where: { id: payload.pricingSessionId, userId, type: "PRICING" },
      select: { id: true },
    });
    if (!pricingSession) {
      return NextResponse.json({ error: "Pricing session not found." }, { status: 404 });
    }
  }

  try {
    const reservation = await reserveGeneration(userId);
    if (!reservation.allowed) {
      return NextResponse.json(
        { error: "Generation limit reached. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(reservation.retryAfterSeconds) },
        }
      );
    }
  } catch (error) {
    console.error("Failed to reserve AI generation capacity:", error);
    return NextResponse.json(
      { error: "Generation is temporarily unavailable. Try again shortly." },
      { status: 503 }
    );
  }

  const { system, user } =
    type === "pricing"
      ? buildPricingPrompt(payload)
      : type === "negotiation"
      ? buildNegotiationPrompt(payload)
      : type === "tradeoff"
      ? buildTradeoffPrompt(payload)
      : type === "proposal"
      ? buildProposalPrompt({ ...payload, clientName: deal!.clientName, dealTitle: deal!.title })
      : type === "scope_change"
      ? buildScopeChangePrompt(payload)
      : buildPaymentTermsPrompt(payload);
  const outputSchema =
    type === "pricing"
      ? PricingResponseSchema
      : type === "negotiation"
      ? NegotiationResponseSchema
      : type === "tradeoff"
      ? TradeoffResponseSchema
      : type === "proposal"
      ? ProposalResponseSchema
      : type === "scope_change"
      ? ScopeChangeResponseSchema
      : PaymentTermsResponseSchema;
  const routing = selectModel({ taskType: type, inputText: user });

  let raw: string;
  let modelUsed: string;

  try {
    ({ raw, modelUsed } = await callOpenRouter({
      models: routing.models,
      systemPrompt: system,
      userPrompt: user,
      userId,
      responseSchema: {
        name: `${type}_advice`,
        schema: z.toJSONSchema(outputSchema) as Record<string, unknown>,
      },
    }));
  } catch (error) {
    console.error("OpenRouter call failed:", error);

    if (error instanceof ConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    return NextResponse.json(
      {
        error:
          "The AI request failed or timed out. Check your OpenRouter account and try again.",
      },
      { status: 502 }
    );
  }

  let parsedOutput: unknown;
  const extraction = extractJson(raw);
  if (!extraction.success) {
    console.error("JSON extraction failed:", extraction.error);

    try {
      const retryResult = await callOpenRouter({
        models: modelsForTier("fast"),
        systemPrompt: "You are a JSON fixer. Respond with ONLY valid JSON matching the requested schema. No markdown, no code fences, no extra text.",
        userPrompt: `Fix and return valid JSON for this response. Do NOT wrap in markdown.\n\nOriginal request context:\n${user.slice(0, 1000)}\n\nBroken response:\n${raw.slice(0, 3000)}`,
        userId,
        responseSchema: {
          name: type === "pricing" ? "pricing_advice" : type === "negotiation" ? "negotiation_advice" : "concession_tradeoff",
          schema: z.toJSONSchema(outputSchema) as Record<string, unknown>,
        },
      });
      const retryExtraction = extractJson(retryResult.raw);
      if (!retryExtraction.success) {
        return NextResponse.json(
          { error: "The model returned malformed JSON. Try again." },
          { status: 502 }
        );
      }
      parsedOutput = retryExtraction.data;
      modelUsed = retryResult.modelUsed;
    } catch {
      return NextResponse.json(
        { error: "The model returned malformed JSON. Try again." },
        { status: 502 }
      );
    }
  } else {
    parsedOutput = extraction.data;
  }

  const validated = outputSchema.safeParse(parsedOutput);
  if (!validated.success) {
    console.error("Invalid model response:", validated.error.flatten());
    return NextResponse.json(
      { error: "The model response was incomplete. Try again." },
      { status: 502 }
    );
  }

  const result = validated.data;
  const dealHealthScore =
    type === "negotiation" && "dealHealthScore" in result
      ? result.dealHealthScore
      : null;

  let recordId: string | null = null;
  let warning: string | undefined;

  try {
    if (type === "pricing" || type === "negotiation") {
      const record = await getPrisma().sessionRecord.create({
        data: {
          userId,
          type: type === "pricing" ? "PRICING" : "NEGOTIATION",
          input: payload,
          output: result,
          dealHealthScore,
          modelUsed,
        },
      });
      recordId = record.id;
    } else if (type === "proposal") {
      const proposalResult = ProposalResponseSchema.parse(result);
      const latest = await getPrisma().proposal.findFirst({
        where: { dealId: payload.dealId, userId },
        orderBy: { version: "desc" },
        select: { version: true },
      });
      const proposal = await getPrisma().proposal.create({
        data: {
          userId,
          dealId: payload.dealId,
          pricingSessionId: payload.pricingSessionId,
          version: (latest?.version ?? 0) + 1,
          tierName: payload.tierName,
          tierPrice: payload.tierPrice,
          scope: payload.scope,
          timeline: payload.timeline,
          exclusions: payload.exclusions,
          content: proposalResult.content,
        },
      });
      if (payload.pricingSessionId) {
        await getPrisma().sessionRecord.update({
          where: { id: payload.pricingSessionId },
          data: { dealId: payload.dealId },
        });
      }
      recordId = proposal.id;
    } else if (type === "scope_change") {
      const scopeChange = await getPrisma().scopeChange.create({
        data: {
          userId,
          dealId: payload.dealId,
          request: payload.request,
          approvedScope: payload.approvedScope,
          output: result,
        },
      });
      recordId = scopeChange.id;
    } else if (type === "payment_terms") {
      const [, paymentSchedule] = await getPrisma().$transaction([
        getPrisma().paymentSchedule.updateMany({
          where: { dealId: payload.dealId, userId, isSelected: true },
          data: { isSelected: false },
        }),
        getPrisma().paymentSchedule.create({
          data: {
            userId,
            dealId: payload.dealId,
            contractValueCents: payload.contractValueCents,
            currency: payload.currency,
            timeline: payload.timeline,
            riskPreference: payload.riskPreference,
            output: result,
            isSelected: true,
          },
        }),
      ]);
      recordId = paymentSchedule.id;
    }
  } catch (error) {
    console.error("Failed to save generation:", error);
    warning = "The advice was generated, but it could not be saved to this deal.";
  }

  return NextResponse.json({
    id: recordId,
    result,
    routing: { tier: routing.tier, reason: routing.reason, modelUsed },
    saved: Boolean(recordId),
    warning,
  });
}
