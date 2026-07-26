-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('PRICING', 'NEGOTIATION');

-- CreateTable
CREATE TABLE "SessionRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SessionType" NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "dealHealthScore" INTEGER,
    "modelUsed" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionRecord_userId_createdAt_idx"
ON "SessionRecord"("userId", "createdAt");
