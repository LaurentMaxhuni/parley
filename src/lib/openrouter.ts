import { getRequiredEnv } from "@/lib/env";

/**
 * OpenRouter integration with prompt-aware, explainable model routing.
 *
 * Defaults are centralized here and can be replaced without editing code by
 * setting OPENROUTER_FAST_MODELS, OPENROUTER_STANDARD_MODELS, or
 * OPENROUTER_POWER_MODELS to comma-separated model slugs.
 */

export type TaskType = "pricing" | "negotiation" | "tradeoff";

export const MODEL_TIERS = {
  fast: {
    primary: "nvidia/nemotron-nano-9b-v2:free",
    fallbacks: ["openai/gpt-oss-20b:free", "google/gemma-4-26b-a4b-it:free"],
  },
  standard: {
    primary: "openai/gpt-oss-20b:free",
    fallbacks: [
      "nvidia/nemotron-3-super-120b-a12b:free",
      "google/gemma-4-26b-a4b-it:free",
    ],
  },
  power: {
    primary: "nvidia/nemotron-3-super-120b-a12b:free",
    fallbacks: ["openai/gpt-oss-20b:free", "google/gemma-4-26b-a4b-it:free"],
  },
} as const;

export type ModelTier = keyof typeof MODEL_TIERS;

interface SelectModelInput {
  taskType: TaskType;
  inputText: string;
}

interface SelectModelResult {
  tier: ModelTier;
  models: string[];
  reason: string;
}

const DOLLAR_PATTERN = /\$\s?\d[\d,]*(\.\d+)?|\b\d{2,}\s?(k|usd|dollars)\b/gi;
const HIGH_STAKES_KEYWORDS =
  /\b(final offer|walk away|contract|urgent|deadline|lawsuit|breach)\b/i;
const MODEL_ENV: Record<ModelTier, string> = {
  fast: "OPENROUTER_FAST_MODELS",
  standard: "OPENROUTER_STANDARD_MODELS",
  power: "OPENROUTER_POWER_MODELS",
};

export function modelsForTier(tier: ModelTier): string[] {
  const override = process.env[MODEL_ENV[tier]]
    ?.split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  if (override?.length) {
    return override;
  }

  const { primary, fallbacks } = MODEL_TIERS[tier];
  return [primary, ...fallbacks];
}

/**
 * Scores each request using simple, presentation-friendly signals.
 */
export function selectModel({
  taskType,
  inputText,
}: SelectModelInput): SelectModelResult {
  let score = taskType === "pricing" || taskType === "tradeoff" ? 2 : 1;
  const reasons: string[] = [`task type "${taskType}" (base weight ${score})`];

  const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount > 120) {
    score += 2;
    reasons.push(`long input (${wordCount} words)`);
  } else if (wordCount > 50) {
    score += 1;
    reasons.push(`medium input (${wordCount} words)`);
  }

  const dollarMatches = inputText.match(DOLLAR_PATTERN);
  if (dollarMatches?.length) {
    score += 1;
    reasons.push(`mentions specific dollar amounts (${dollarMatches.length})`);
  }

  if (HIGH_STAKES_KEYWORDS.test(inputText)) {
    score += 2;
    reasons.push("high-stakes language detected");
  }

  const tier: ModelTier =
    score <= 2 ? "fast" : score <= 4 ? "standard" : "power";

  return {
    tier,
    models: modelsForTier(tier),
    reason: `Routed to "${tier}" tier (score ${score}: ${reasons.join(", ")})`,
  };
}

interface CallOpenRouterInput {
  models: string[];
  systemPrompt: string;
  userPrompt: string;
  userId: string;
  responseSchema: {
    name: string;
    schema: Record<string, unknown>;
  };
}

interface CallOpenRouterResult {
  raw: string;
  modelUsed: string;
}

/**
 * Calls OpenRouter with native model fallback and strict structured output.
 * The stable user ID helps OpenRouter detect abuse without
 * receiving the user's email address.
 */
export async function callOpenRouter({
  models,
  systemPrompt,
  userPrompt,
  userId,
  responseSchema,
}: CallOpenRouterInput): Promise<CallOpenRouterResult> {
  const apiKey = getRequiredEnv("OPENROUTER_API_KEY");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
      "X-OpenRouter-Title": process.env.OPENROUTER_SITE_NAME ?? "Parley",
    },
    signal: AbortSignal.timeout(60_000),
    body: JSON.stringify({
      models,
      route: "fallback",
      user: userId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 2200,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: responseSchema.name,
          strict: true,
          schema: responseSchema.schema,
        },
      },
    }),
  });

  if (!response.ok) {
    const text = (await response.text()).slice(0, 1000);
    throw new Error(`OpenRouter request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const completionError = data?.choices?.[0]?.error;
  const content = data?.choices?.[0]?.message?.content;
  const modelUsed = data?.model ?? models[0];

  if (completionError) {
    throw new Error(
      `OpenRouter completion failed: ${completionError.message ?? "Unknown error"}`
    );
  }

  if (typeof content !== "string" || !content) {
    throw new Error("OpenRouter returned no content.");
  }

  return { raw: content, modelUsed };
}
