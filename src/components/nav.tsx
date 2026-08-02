"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage } from "@/lib/auth/errors";
import { Button } from "@/components/ui/button";

export function Nav({ signedIn = false }: { signedIn?: boolean }) {
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOut() {
    setSignOutError(null);
    const { error } = await authClient.signOut();
    if (error) {
      setSignOutError(error.code === "INVALID_ORIGIN" ? authErrorMessage(error) : error.message || "Could not sign out. Please try again.");
      return;
    }
    window.location.assign("/");
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative flex items-center justify-between border-b border-ink-line px-6 py-4 md:px-10"
    >
      <Link href="/" className="font-display text-lg italic text-cream">
        Parley
      </Link>

      <div className="flex items-center gap-2">
        {signedIn ? (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/pricing">Pricing Advisor</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/negotiate">Negotiate</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
          </>
        )}
      </div>
      {signOutError && <p role="alert" className="absolute right-6 top-16 max-w-xs rounded-md bg-redline/10 px-3 py-2 text-xs text-redline md:right-10">{signOutError}</p>}
    </motion.nav>
  );
}
