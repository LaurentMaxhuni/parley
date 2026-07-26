import { PrismaClient } from "@prisma/client";
import { getRequiredEnv } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma is initialized lazily so importing a route during `next build` does
 * not require DATABASE_URL. The singleton prevents hot reload from creating a
 * new connection pool on every save.
 */
export function getPrisma(): PrismaClient {
  getRequiredEnv("DATABASE_URL");

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }

  return globalForPrisma.prisma;
}
