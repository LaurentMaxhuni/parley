import { z } from "zod";

export const PricingRequestSchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, "Tell us a bit more about what you sell.")
    .max(4000, "Keep the description under 4,000 characters."),
  targetMarket: z
    .string()
    .trim()
    .min(3, "Tell us who the offer is for.")
    .max(500, "Keep the target market under 500 characters."),
  competitors: z.string().trim().max(1000).optional().default(""),
});
export type PricingRequest = z.infer<typeof PricingRequestSchema>;

export const PricingResponseSchema = z.object({
  tiers: z
    .array(
      z.object({
        name: z.string().min(1).max(80),
        price: z.string().min(1).max(80), // "$49/mo", "$1,200 flat", etc.
        bestFor: z.string().min(1).max(500),
        features: z.array(z.string().min(1).max(300)).min(1).max(8),
      })
    )
    .min(2)
    .max(4),
  positioningCopy: z.string().min(1).max(2000),
  reasoning: z.string().min(1).max(2000),
});
export type PricingResponse = z.infer<typeof PricingResponseSchema>;

export const NegotiationRequestSchema = z.object({
  yourAsk: z
    .string()
    .trim()
    .min(3, "What did you ask for or quote?")
    .max(500, "Keep your original ask under 500 characters."),
  clientMessage: z
    .string()
    .trim()
    .min(10, "Paste what the client said.")
    .max(4000, "Keep the client message under 4,000 characters."),
  context: z.string().trim().max(2000).optional().default(""),
});
export type NegotiationRequest = z.infer<typeof NegotiationRequestSchema>;

export const NegotiationResponseSchema = z.object({
  dealHealthScore: z.number().int().min(0).max(100),
  verdict: z.enum(["hold_firm", "counter", "compromise", "walk_away"]),
  counterMessage: z.string().min(1).max(3000),
  reasoning: z.string().min(1).max(2000),
});
export type NegotiationResponse = z.infer<typeof NegotiationResponseSchema>;

export const TradeoffRequestSchema = NegotiationRequestSchema.extend({
  concession: z
    .string()
    .trim()
    .min(3, "Describe the concession the client is asking for.")
    .max(1000, "Keep the concession under 1,000 characters."),
});
export type TradeoffRequest = z.infer<typeof TradeoffRequestSchema>;

export const TradeoffResponseSchema = z.object({
  give: z.string().min(1).max(500),
  get: z.string().min(1).max(500),
  rationale: z.string().min(1).max(1000),
  message: z.string().min(1).max(2000),
});
export type TradeoffResponse = z.infer<typeof TradeoffResponseSchema>;

export const ProposalRequestSchema = z.object({
  dealId: z.string().cuid(),
  pricingSessionId: z.string().cuid().optional(),
  tierName: z.string().trim().min(2).max(80),
  tierPrice: z.string().trim().min(1).max(80),
  scope: z.string().trim().min(10).max(5000),
  timeline: z.string().trim().min(2).max(500),
  exclusions: z.string().trim().max(3000).optional().default(""),
});
export type ProposalRequest = z.infer<typeof ProposalRequestSchema>;

export const ProposalResponseSchema = z.object({
  content: z.string().min(100).max(12000),
});
export type ProposalResponse = z.infer<typeof ProposalResponseSchema>;

export const ScopeChangeRequestSchema = z.object({
  dealId: z.string().cuid(),
  approvedScope: z.string().trim().min(10).max(5000),
  request: z.string().trim().min(10).max(4000),
});
export type ScopeChangeRequest = z.infer<typeof ScopeChangeRequestSchema>;

export const ScopeChangeResponseSchema = z.object({
  assessment: z.enum(["in_scope", "change_order", "needs_review"]),
  reasoning: z.string().min(1).max(1500),
  priceImpact: z.string().min(1).max(500),
  timelineImpact: z.string().min(1).max(500),
  changeOrderMessage: z.string().min(1).max(3000),
});
export type ScopeChangeResponse = z.infer<typeof ScopeChangeResponseSchema>;

export const PaymentTermsRequestSchema = z.object({
  dealId: z.string().cuid(),
  contractValueCents: z.number().int().min(1).max(100_000_000),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  timeline: z.string().trim().min(2).max(500),
  riskPreference: z.enum(["balanced", "protective", "flexible"]),
});
export type PaymentTermsRequest = z.infer<typeof PaymentTermsRequestSchema>;

export const PaymentTermsResponseSchema = z.object({
  summary: z.string().min(1).max(1500),
  milestones: z.array(z.object({
    label: z.string().min(1).max(160),
    percentage: z.number().int().min(1).max(100),
    trigger: z.string().min(1).max(500),
  })).min(1).max(6),
  latePaymentTerms: z.string().min(1).max(1200),
  cancellationTerms: z.string().min(1).max(1200),
  clientSummary: z.string().min(1).max(3000),
}).refine(
  (response) => response.milestones.reduce((total, milestone) => total + milestone.percentage, 0) === 100,
  "Payment milestones must add up to 100%."
);
export type PaymentTermsResponse = z.infer<typeof PaymentTermsResponseSchema>;

const JSON_FORMAT_RULE =
  "Respond with ONLY a single valid JSON object. No markdown fences, no commentary before or after.";

export function buildPricingPrompt(req: PricingRequest) {
  const system = `You are a pragmatic pricing strategist who helps freelancers and small businesses price their work. You give specific, defensible numbers, not vague ranges. ${JSON_FORMAT_RULE}

Return JSON matching exactly this shape:
{
  "tiers": [{ "name": string, "price": string, "bestFor": string, "features": string[] }], // 2-3 tiers
  "positioningCopy": string, // 2-3 sentences the business could put on a pricing page
  "reasoning": string // brief explanation of the pricing logic, 2-4 sentences
}`;

  const user = `Product/service: ${req.description}
Target market: ${req.targetMarket}
Known competitors or comparable offerings: ${req.competitors || "none given"}`;

  return { system, user };
}

export function buildNegotiationPrompt(req: NegotiationRequest) {
  const system = `You are a calm, firm negotiation coach for freelancers and small business owners. You help them respond to client pushback without folding immediately, but you're also honest when a compromise genuinely is the smart move. ${JSON_FORMAT_RULE}

Return JSON matching exactly this shape:
{
  "dealHealthScore": number, // 0-100. 100 = you have all the leverage, 0 = walk away now
  "verdict": "hold_firm" | "counter" | "compromise" | "walk_away",
  "counterMessage": string, // a ready-to-send reply, professional tone, 3-6 sentences
  "reasoning": string // why this score/verdict, 2-4 sentences
}`;

  const user = `What I asked for / quoted: ${req.yourAsk}
What the client said back: ${req.clientMessage}
Additional context: ${req.context || "none given"}`;

  return { system, user };
}

export function buildTradeoffPrompt(req: TradeoffRequest) {
  const system = `You are a practical negotiation strategist. Convert a requested concession into a balanced, specific trade: if the client gets something, the business gets a concrete counterweight. Do not recommend an unconditional discount. ${JSON_FORMAT_RULE}

Return JSON matching exactly this shape:
{
  "give": string, // the limited concession to offer, if any
  "get": string, // the exact term, scope, payment, timeline, or commitment requested in return
  "rationale": string, // 1-3 sentences explaining why this preserves leverage
  "message": string // a ready-to-send reply, 2-5 sentences
}`;

  const user = `Original ask: ${req.yourAsk}
Client message: ${req.clientMessage}
Context: ${req.context || "none given"}
Requested concession to evaluate: ${req.concession}`;

  return { system, user };
}

export function buildProposalPrompt(req: ProposalRequest & { clientName: string; dealTitle: string }) {
  const system = `You write concise, clear service proposals for freelancers and small businesses. Create a ready-to-send, editable plain-text proposal. Include: title, client, scope of work, timeline, investment, exclusions, acceptance next step, and a short non-legal advisory disclaimer. Do not invent deliverables or guarantees. ${JSON_FORMAT_RULE}

Return JSON matching exactly this shape:
{
  "content": string
}`;

  const user = `Deal: ${req.dealTitle}
Client: ${req.clientName}
Selected tier: ${req.tierName} at ${req.tierPrice}
Scope: ${req.scope}
Timeline: ${req.timeline}
Exclusions: ${req.exclusions || "None specified"}`;

  return { system, user };
}

export function buildScopeChangePrompt(req: ScopeChangeRequest) {
  const system = `You are a practical scope-control advisor for freelancers. Compare the requested work against the approved scope. Be conservative: only call it in scope when it is clearly covered. Recommend a change order whenever extra work, revision rounds, responsibility, or timeline pressure is introduced. ${JSON_FORMAT_RULE}

Return JSON matching exactly this shape:
{
  "assessment": "in_scope" | "change_order" | "needs_review",
  "reasoning": string,
  "priceImpact": string,
  "timelineImpact": string,
  "changeOrderMessage": string
}`;

  const user = `Approved scope: ${req.approvedScope}
New client request: ${req.request}`;

  return { system, user };
}

export function buildPaymentTermsPrompt(req: PaymentTermsRequest) {
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: req.currency,
    maximumFractionDigits: 2,
  }).format(req.contractValueCents / 100);
  const system = `You design practical payment schedules for independent service businesses. Keep the freelancer protected without making routine engagements needlessly hard to close. Milestone percentages must add up to exactly 100. The language is commercial guidance, not legal advice. ${JSON_FORMAT_RULE}

Return JSON matching exactly this shape:
{
  "summary": string,
  "milestones": [{ "label": string, "percentage": number, "trigger": string }],
  "latePaymentTerms": string,
  "cancellationTerms": string,
  "clientSummary": string
}`;

  const user = `Contract value: ${amount}
Project timeline: ${req.timeline}
Risk preference: ${req.riskPreference}`;

  return { system, user };
}
