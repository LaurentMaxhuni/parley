"use server";

import { z } from "zod";
import { getAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

const SignUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
});

export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const parsed = SignUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your account details." };
  }

  try {
    const { error } = await getAuth().signUp.email(parsed.data);
    if (error) {
      return { error: error.message || "Failed to create account." };
    }
  } catch (error) {
    console.error("Sign up failed:", error);
    return { error: "The authentication service is unavailable. Check the server configuration." };
  }

  redirect("/pricing");
}
