import { NextResponse } from "next/server";
import { getConfigurationStatus } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const configuration = getConfigurationStatus();

  if (!configuration.configured) {
    return NextResponse.json(
      {
        status: "not_configured",
        missing: configuration.missing,
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  try {
    await getPrisma().$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        status: "ok",
        database: "reachable",
        auth: "configured",
        ai: "configured",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "degraded",
        database: "unreachable",
        auth: "configured",
        ai: "configured",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
