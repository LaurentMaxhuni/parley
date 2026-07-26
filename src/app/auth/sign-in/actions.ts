"use server";

import { z } from "zod";
import { getAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

const SignInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
});

export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your sign-in details." };
  }

  try {
    const { error } = await getAuth().signIn.email(parsed.data);
    if (error) {
      return { error: error.message || "Failed to sign in. Try again." };
    }
  } catch (error) {
    console.error("Sign in failed:", error);
    return { error: "The authentication service is unavailable. Check the server configuration." };
  }

  redirect("/pricing");
}
