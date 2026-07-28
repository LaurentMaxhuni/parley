import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuth } from "@/lib/auth/server";
import { getPrisma } from "@/lib/prisma";

const UpdateDealSchema = z
  .object({
    status: z.enum(["LEAD", "PROPOSAL_SENT", "NEGOTIATING", "WON", "LOST"]).optional(),
    quotedValueCents: z.number().int().min(0).max(100_000_000).nullable().optional(),
    currency: z.string().trim().length(3).transform((value) => value.toUpperCase()).optional(),
    targetCloseDate: z.string().date().nullable().optional(),
    notes: z.string().trim().max(5000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "Provide at least one update.");

async function signedInUserId() {
  const { data: session } = await getAuth().getSession();
  return session?.user?.id ?? null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await signedInUserId();
    if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    const { id } = await params;
    const parsed = UpdateDealSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid deal update.", details: parsed.error.flatten() }, { status: 400 });

    const existing = await getPrisma().deal.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Deal not found." }, { status: 404 });

    const input = parsed.data;
    const deal = await getPrisma().deal.update({
      where: { id: existing.id },
      data: {
        ...input,
        targetCloseDate:
          input.targetCloseDate === undefined
            ? undefined
            : input.targetCloseDate
            ? new Date(`${input.targetCloseDate}T00:00:00.000Z`)
            : null,
      },
    });
    return NextResponse.json({ deal });
  } catch (error) {
    console.error("Updating deal failed:", error);
    return NextResponse.json({ error: "Could not update the deal." }, { status: 503 });
  }
}
