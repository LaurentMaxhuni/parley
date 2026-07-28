-- A user-owned workspace groups Parley's pricing, negotiation, proposal,
-- scope, and payment records into one client engagement.
CREATE TYPE "DealStatus" AS ENUM ('LEAD', 'PROPOSAL_SENT', 'NEGOTIATING', 'WON', 'LOST');
CREATE TYPE "ScopeChangeStatus" AS ENUM ('RECOMMENDED', 'APPROVED', 'DECLINED');

CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "DealStatus" NOT NULL DEFAULT 'LEAD',
    "quotedValueCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "targetCloseDate" TIMESTAMP(3),
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "pricingSessionId" TEXT,
    "version" INTEGER NOT NULL,
    "tierName" TEXT NOT NULL,
    "tierPrice" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "exclusions" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScopeChange" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "request" TEXT NOT NULL,
    "approvedScope" TEXT NOT NULL,
    "status" "ScopeChangeStatus" NOT NULL DEFAULT 'RECOMMENDED',
    "output" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ScopeChange_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentSchedule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "contractValueCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timeline" TEXT NOT NULL,
    "riskPreference" TEXT NOT NULL,
    "output" JSONB NOT NULL,
    "isSelected" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PaymentSchedule_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SessionRecord" ADD COLUMN "dealId" TEXT;

CREATE UNIQUE INDEX "Proposal_dealId_version_key" ON "Proposal"("dealId", "version");
CREATE INDEX "Deal_userId_status_updatedAt_idx" ON "Deal"("userId", "status", "updatedAt");
CREATE INDEX "Proposal_userId_dealId_createdAt_idx" ON "Proposal"("userId", "dealId", "createdAt");
CREATE INDEX "ScopeChange_userId_dealId_createdAt_idx" ON "ScopeChange"("userId", "dealId", "createdAt");
CREATE INDEX "PaymentSchedule_userId_dealId_createdAt_idx" ON "PaymentSchedule"("userId", "dealId", "createdAt");
CREATE INDEX "SessionRecord_dealId_createdAt_idx" ON "SessionRecord"("dealId", "createdAt");

ALTER TABLE "SessionRecord" ADD CONSTRAINT "SessionRecord_dealId_fkey"
  FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_dealId_fkey"
  FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScopeChange" ADD CONSTRAINT "ScopeChange_dealId_fkey"
  FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentSchedule" ADD CONSTRAINT "PaymentSchedule_dealId_fkey"
  FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
