import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuth } from "@/lib/auth/server";
import { getPrisma } from "@/lib/prisma";
import { reserveGeneration } from "@/lib/generation-rate-limit";
import { ConfigurationError } from "@/lib/env";
import { selectModel, callOpenRouter } from "@/lib/openrouter";
import {
  PricingRequestSchema,
  PricingResponseSchema,
  NegotiationRequestSchema,
  NegotiationResponseSchema,
  buildPricingPrompt,
  buildNegotiationPrompt,
} from "@/lib/prompts";

const BodySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("pricing"), payload: PricingRequestSchema }),
  z.object({ type: z.literal("negotiation"), payload: NegotiationRequestSchema }),
]);

function authenticationError(error: unknown) {
  if (error instanceof ConfigurationError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  console.error("Authentication failed:", error);
  return NextResponse.json(
    { error: "The authentication service is unavailable. Try again shortly." },
    { status: 503 }
  );
}

export async function POST(req: NextRequest) {
  let userId: string;

  try {
    const { data: session } = await getAuth().getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    userId = session.user.id;
  } catch (error) {
    return authenticationError(error);
  }

  const body = await req.json().catch(() => null);
  const parsedBody = BodySchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid input.", details: parsedBody.error.flatten() },
      { status: 400 }
    );
  }

  const { type, payload } = parsedBody.data;

  try {
    const reservation = await reserveGeneration(userId);
    if (!reservation.allowed) {
      return NextResponse.json(
        { error: "Generation limit reached. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(reservation.retryAfterSeconds) },
        }
      );
    }
  } catch (error) {
    console.error("Failed to reserve AI generation capacity:", error);
    return NextResponse.json(
      { error: "Generation is temporarily unavailable. Try again shortly." },
      { status: 503 }
    );
  }

  const { system, user } =
    type === "pricing"
      ? buildPricingPrompt(payload)
      : buildNegotiationPrompt(payload);
  const outputSchema =
    type === "pricing" ? PricingResponseSchema : NegotiationResponseSchema;
  const routing = selectModel({ taskType: type, inputText: user });

  let raw: string;
  let modelUsed: string;

  try {
    ({ raw, modelUsed } = await callOpenRouter({
      models: routing.models,
      systemPrompt: system,
      userPrompt: user,
      userId,
      responseSchema: {
        name: type === "pricing" ? "pricing_advice" : "negotiation_advice",
        schema: z.toJSONSchema(outputSchema) as Record<string, unknown>,
      },
    }));
  } catch (error) {
    console.error("OpenRouter call failed:", error);

    if (error instanceof ConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    return NextResponse.json(
      {
        error:
          "The AI request failed or timed out. Check your OpenRouter account and try again.",
      },
      { status: 502 }
    );
  }

  let parsedOutput: unknown;
  try {
    parsedOutput = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "The model returned malformed JSON. Try again." },
      { status: 502 }
    );
  }

  const validated = outputSchema.safeParse(parsedOutput);
  if (!validated.success) {
    console.error("Invalid model response:", validated.error.flatten());
    return NextResponse.json(
      { error: "The model response was incomplete. Try again." },
      { status: 502 }
    );
  }

  const result = validated.data;
  const dealHealthScore =
    type === "negotiation" && "dealHealthScore" in result
      ? result.dealHealthScore
      : null;

  let recordId: string | null = null;
  let warning: string | undefined;

  try {
    const record = await getPrisma().sessionRecord.create({
      data: {
        userId,
        type: type === "pricing" ? "PRICING" : "NEGOTIATION",
        input: payload,
        output: result,
        dealHealthScore,
        modelUsed,
      },
    });
    recordId = record.id;
  } catch (error) {
    console.error("Failed to save generation:", error);
    warning = "The advice was generated, but it could not be added to history.";
  }

  return NextResponse.json({
    id: recordId,
    result,
    routing: { tier: routing.tier, reason: routing.reason, modelUsed },
    saved: Boolean(recordId),
    warning,
  });
}
