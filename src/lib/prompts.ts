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
