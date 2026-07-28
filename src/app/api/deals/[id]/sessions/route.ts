import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuth } from "@/lib/auth/server";
import { getPrisma } from "@/lib/prisma";

const BodySchema = z.object({ sessionId: z.string().cuid() });

async function signedInUserId() {
  const { data: session } = await getAuth().getSession();
  return session?.user?.id ?? null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await signedInUserId();
    if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    const { id: dealId } = await params;
    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid session." }, { status: 400 });

    const [deal, session] = await Promise.all([
      getPrisma().deal.findFirst({ where: { id: dealId, userId }, select: { id: true } }),
      getPrisma().sessionRecord.findFirst({ where: { id: parsed.data.sessionId, userId }, select: { id: true } }),
    ]);
    if (!deal || !session) return NextResponse.json({ error: "Deal or session not found." }, { status: 404 });

    await getPrisma().sessionRecord.update({ where: { id: session.id }, data: { dealId: deal.id } });
    return NextResponse.json({ linked: true });
  } catch (error) {
    console.error("Linking session failed:", error);
    return NextResponse.json({ error: "Could not link that session." }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await signedInUserId();
    if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    const { id: dealId } = await params;
    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid session." }, { status: 400 });

    const updated = await getPrisma().sessionRecord.updateMany({
      where: { id: parsed.data.sessionId, userId, dealId },
      data: { dealId: null },
    });
    if (!updated.count) return NextResponse.json({ error: "Linked session not found." }, { status: 404 });
    return NextResponse.json({ linked: false });
  } catch (error) {
    console.error("Unlinking session failed:", error);
    return NextResponse.json({ error: "Could not unlink that session." }, { status: 503 });
  }
}
