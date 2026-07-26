# PROMPTS.md

The exact prompts Parley sends to the AI model for each tool, and the
reasoning behind the model-routing logic that decides *which* model
handles a given request. Pulled directly from `src/lib/prompts.ts` and
`src/lib/openrouter.ts` — if you change those files, update this doc too.

---

## 1. Pricing Advisor

**System prompt:**

> You are a pragmatic pricing strategist who helps freelancers and small
> businesses price their work. You give specific, defensible numbers, not
> vague ranges. Respond with ONLY a single valid JSON object. No markdown
> fences, no commentary before or after.
>
> Return JSON matching exactly this shape:
> ```json
> {
>   "tiers": [{ "name": string, "price": string, "bestFor": string, "features": string[] }],
>   "positioningCopy": string,
>   "reasoning": string
> }
> ```

**User prompt (filled from the form):**

> Product/service: `{description}`
> Target market: `{targetMarket}`
> Known competitors or comparable offerings: `{competitors}`

**Why this shape:** forcing strict JSON (and validating it server-side with
Zod — see `PricingResponseSchema`) means the UI can render tier cards
directly instead of parsing free-form prose, and a malformed response fails
loudly instead of silently rendering garbage.

---

## 2. Negotiation Counter-Generator

**System prompt:**

> You are a calm, firm negotiation coach for freelancers and small business
> owners. You help them respond to client pushback without folding
> immediately, but you're also honest when a compromise genuinely is the
> smart move. Respond with ONLY a single valid JSON object. No markdown
> fences, no commentary before or after.
>
> Return JSON matching exactly this shape:
> ```json
> {
>   "dealHealthScore": number,
>   "verdict": "hold_firm" | "counter" | "compromise" | "walk_away",
>   "counterMessage": string,
>   "reasoning": string
> }
> ```

**User prompt (filled from the form):**

> What I asked for / quoted: `{yourAsk}`
> What the client said back: `{clientMessage}`
> Additional context: `{context}`

**Why `dealHealthScore` + `verdict` are separate fields:** the score
(0–100) drives the gauge visual; the verdict is a discrete label used for
the badge/heading. Keeping them separate instead of deriving one from the
other in the frontend means the model's own judgment call is what gets
displayed, not a hardcoded threshold guess.

---

## 3. Model routing (`selectModel()` in `src/lib/openrouter.ts`)

Rather than hardcoding one model for every request, each request is scored
and routed to a tier:

| Signal | Weight |
|---|---|
| Task type = pricing (open-ended strategy) | base +2 |
| Task type = negotiation (reacting to one message) | base +1 |
| Input > 120 words | +2 |
| Input 50–120 words | +1 |
| Mentions a specific dollar amount | +1 |
| High-stakes language (`final offer`, `walk away`, `contract`, `urgent`, `deadline`, `lawsuit`, `breach`) | +2 |

| Score | Tier | Example model |
|---|---|---|
| ≤ 2 | `fast` | `anthropic/claude-haiku-4.5` |
| 3–4 | `standard` | `anthropic/claude-sonnet-5` |
| ≥ 5 | `power` | `anthropic/claude-opus-5` |

Each tier also carries a fallback list, passed to OpenRouter's native
`models: [...]` array so a rate-limited or down provider doesn't hard-fail
the request — OpenRouter tries the next model in the list automatically.

**The reasoning behind routing this way (good material for the "explain
your process" part of the defense):** a two-sentence negotiation reply and
a full market-pricing strategy aren't the same job. Sending both to the
biggest/most expensive model every time wastes money; sending both to the
cheapest model every time risks a bad pricing strategy going out under a
freelancer's name. Scoring the actual request lets 80% of traffic (short,
low-stakes) run cheap and fast, while the requests that matter most —
long, numeric, high-stakes — get the strongest reasoning available.

The routing decision (`tier`, model actually used, and the reason string)
is surfaced in the UI as a small badge on every result, so it's visible
during a live demo, not just in the logs.
