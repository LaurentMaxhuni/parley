import { PrismaClient } from "@prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";
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
  const databaseUrl = getRequiredEnv("DATABASE_URL");

  if (!globalForPrisma.prisma) {
    // Use Neon’s HTTP driver to avoid the Windows Schannel TLS path used by
    // Prisma’s native engine during local development.
    const adapter = new PrismaNeonHTTP(databaseUrl, {});
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.prisma;
}
