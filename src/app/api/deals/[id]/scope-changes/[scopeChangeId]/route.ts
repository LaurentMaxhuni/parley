import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuth } from "@/lib/auth/server";
import { getPrisma } from "@/lib/prisma";

const BodySchema = z.object({ status: z.enum(["APPROVED", "DECLINED", "RECOMMENDED"]) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; scopeChangeId: string }> }
) {
  try {
    const { data: session } = await getAuth().getSession();
    if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    const { id: dealId, scopeChangeId } = await params;
    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid scope-change status." }, { status: 400 });

    const scopeChange = await getPrisma().scopeChange.findFirst({
      where: { id: scopeChangeId, dealId, userId: session.user.id },
      select: { id: true },
    });
    if (!scopeChange) return NextResponse.json({ error: "Scope change not found." }, { status: 404 });

    const updated = await getPrisma().scopeChange.update({
      where: { id: scopeChange.id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json({ scopeChange: updated });
  } catch (error) {
    console.error("Updating scope change failed:", error);
    return NextResponse.json({ error: "Could not update the scope change." }, { status: 503 });
  }
}
