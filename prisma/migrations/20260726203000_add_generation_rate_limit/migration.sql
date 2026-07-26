-- Protect the shared AI-provider quota with an atomic per-user request bucket.
CREATE TABLE "GenerationRateLimit" (
    "userId" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GenerationRateLimit_pkey" PRIMARY KEY ("userId", "windowStart")
);
