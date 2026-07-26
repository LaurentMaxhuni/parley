"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-center">
      <div className="max-w-md">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-redline">
          Something went wrong
        </p>
        <h1 className="mt-3 font-display text-3xl text-cream">
          Parley could not load this page.
        </h1>
        <p className="mt-4 text-sm text-slate-text">
          Check the environment variables and database migration, then try again.
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
