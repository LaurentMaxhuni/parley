"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signInWithEmail } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);
  const [googlePending, setGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setGooglePending(true);
    setGoogleError(null);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
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
          <h1 className="mt-4 font-display text-2xl text-cream">Sign in</h1>
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
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>

        {state?.error && (
          <div role="alert" className="rounded-md bg-redline/10 px-3 py-2 text-sm text-redline">
            {state.error}
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Signing in…" : "Sign in"}
        </Button>

        <div className="flex items-center gap-3 text-xs text-slate-text" aria-hidden="true">
          <span className="h-px flex-1 bg-ink-line" />
          or
          <span className="h-px flex-1 bg-ink-line" />
        </div>
        <Button type="button" variant="outline" disabled={googlePending} onClick={signInWithGoogle} className="w-full gap-3">
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {googlePending ? "Redirecting to Google..." : "Continue with Google"}
        </Button>
        {googleError && <div role="alert" className="rounded-md bg-redline/10 px-3 py-2 text-sm text-redline">{googleError}</div>}

        <p className="text-center text-sm text-slate-text">
          New here?{" "}
          <Link href="/auth/sign-up" className="text-brass-soft underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
