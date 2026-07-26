import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";
import { getPrisma } from "@/lib/prisma";
import { ConfigurationError } from "@/lib/env";

export async function GET() {
  try {
    const { data: session } = await getAuth().getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const records = await getPrisma().sessionRecord.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error("History request failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof ConfigurationError
            ? error.message
            : "History is temporarily unavailable.",
      },
      { status: 503 }
    );
  }
}
