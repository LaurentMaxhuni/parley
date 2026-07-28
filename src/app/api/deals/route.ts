import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuth } from "@/lib/auth/server";
import { getPrisma } from "@/lib/prisma";
import { ConfigurationError } from "@/lib/env";

const DealSchema = z.object({
  clientName: z.string().trim().min(2).max(160),
  title: z.string().trim().min(2).max(200),
  quotedValueCents: z.number().int().min(0).max(100_000_000).nullable().optional(),
  currency: z.string().trim().length(3).default("USD").transform((value) => value.toUpperCase()),
  targetCloseDate: z.string().date().nullable().optional(),
  notes: z.string().trim().max(5000).default(""),
});

async function userIdFromSession() {
  const { data: session } = await getAuth().getSession();
  return session?.user?.id ?? null;
}

export async function GET() {
  try {
    const userId = await userIdFromSession();
    if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const deals = await getPrisma().deal.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { proposals: true, scopeChanges: true, sessions: true } } },
    });
    return NextResponse.json({ deals });
  } catch (error) {
    console.error("Deals request failed:", error);
    return NextResponse.json(
      { error: error instanceof ConfigurationError ? error.message : "Deals are temporarily unavailable." },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await userIdFromSession();
    if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const parsed = DealSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid deal details.", details: parsed.error.flatten() }, { status: 400 });
    }

    const input = parsed.data;
    const deal = await getPrisma().deal.create({
      data: {
        userId,
        clientName: input.clientName,
        title: input.title,
        quotedValueCents: input.quotedValueCents ?? null,
        currency: input.currency,
        targetCloseDate: input.targetCloseDate ? new Date(`${input.targetCloseDate}T00:00:00.000Z`) : null,
        notes: input.notes,
      },
    });

    return NextResponse.json({ deal }, { status: 201 });
  } catch (error) {
    console.error("Creating deal failed:", error);
    return NextResponse.json(
      { error: error instanceof ConfigurationError ? error.message : "Could not create the deal." },
      { status: 503 }
    );
  }
}
