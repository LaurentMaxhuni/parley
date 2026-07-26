"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUpWithEmail } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);
  const [googlePending, setGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  async function signUpWithGoogle() {
    setGooglePending(true);
    setGoogleError(null);
    const { data, error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
      disableRedirect: true,
    });
    if (data?.url) {
      window.location.assign(data.url);
      return;
    }
    if (error) {
      setGoogleError(error.message || "Google sign-in could not be started.");
    }
    setGooglePending(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <form action={formAction} className="flex w-full max-w-sm flex-col gap-5">
        <div className="mb-2 text-center">
          <Link href="/" className="font-display text-lg italic text-cream">
            Parley
          </Link>
          <h1 className="mt-4 font-display text-2xl text-cream">Create your account</h1>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            placeholder="Jamie Rivera"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="jamie@studio.co"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>

        {state?.error && (
          <div role="alert" className="rounded-md bg-redline/10 px-3 py-2 text-sm text-redline">
            {state.error}
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating account…" : "Create account"}
        </Button>

        <div className="flex items-center gap-3 text-xs text-slate-text" aria-hidden="true">
          <span className="h-px flex-1 bg-ink-line" />
          or
          <span className="h-px flex-1 bg-ink-line" />
        </div>
        <Button type="button" variant="outline" disabled={googlePending} onClick={signUpWithGoogle} className="w-full">
          {googlePending ? "Redirecting to Google..." : "Continue with Google"}
        </Button>
        {googleError && <div role="alert" className="rounded-md bg-redline/10 px-3 py-2 text-sm text-redline">{googleError}</div>}

        <p className="text-center text-sm text-slate-text">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-brass-soft underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
