import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuth } from "@/lib/auth/server";
import { getPrisma } from "@/lib/prisma";

const BodySchema = z.object({ content: z.string().trim().min(100).max(12000) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> }
) {
  try {
    const { data: session } = await getAuth().getSession();
    if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    const { id: dealId, proposalId } = await params;
    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Proposal text must be between 100 and 12,000 characters." }, { status: 400 });

    const proposal = await getPrisma().proposal.findFirst({
      where: { id: proposalId, dealId, userId: session.user.id },
      select: { id: true },
    });
    if (!proposal) return NextResponse.json({ error: "Proposal not found." }, { status: 404 });

    const updated = await getPrisma().proposal.update({
      where: { id: proposal.id },
      data: { content: parsed.data.content },
    });
    return NextResponse.json({ proposal: updated });
  } catch (error) {
    console.error("Updating proposal failed:", error);
    return NextResponse.json({ error: "Could not update the proposal." }, { status: 503 });
  }
}
