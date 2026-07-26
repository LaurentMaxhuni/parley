import { getPrisma } from "@/lib/prisma";

const WINDOW_MS = 60_000;
const MAX_GENERATIONS_PER_WINDOW = 6;

export type GenerationRateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

/**
 * Atomically reserves one AI generation in a fixed one-minute window. Using
 * Postgres rather than process memory keeps the limit effective across
 * serverless instances and concurrent requests.
 */
export async function reserveGeneration(
  userId: string,
  now = new Date()
): Promise<GenerationRateLimitResult> {
  const windowStart = new Date(
    Math.floor(now.getTime() / WINDOW_MS) * WINDOW_MS
  );
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((windowStart.getTime() + WINDOW_MS - now.getTime()) / 1000)
  );

  const reserved = await getPrisma().$queryRaw<Array<{ requestCount: number }>>`
    INSERT INTO "GenerationRateLimit" ("userId", "windowStart", "requestCount")
    VALUES (${userId}, ${windowStart}, 1)
    ON CONFLICT ("userId", "windowStart")
    DO UPDATE SET "requestCount" = "GenerationRateLimit"."requestCount" + 1
    WHERE "GenerationRateLimit"."requestCount" < ${MAX_GENERATIONS_PER_WINDOW}
    RETURNING "requestCount"
  `;

  return { allowed: reserved.length === 1, retryAfterSeconds };
}
