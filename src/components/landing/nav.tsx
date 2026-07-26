"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { List, X } from "@phosphor-icons/react";
import { useState } from "react";

interface LandingNavProps {
  signedIn: boolean;
}

export function LandingNav({ signedIn }: LandingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-paper/80 backdrop-blur-lg border-b border-paper-line"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-display text-xl italic text-ink hover:text-brass transition-colors">
            Parley
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-ink/70 hover:text-brass transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {signedIn ? (
              <Button asChild variant="paper" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-ink-text hover:bg-paper-line">
                  <Link href="/auth/sign-in">Sign in</Link>
                </Button>
                <Button asChild variant="paper" size="sm">
                  <Link href="/auth/sign-up">Get started</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-ink hover:text-brass transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-paper-line bg-paper"
        >
          <div className="px-6 py-4 space-y-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm text-ink/70 hover:text-brass transition-colors py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-paper-line flex flex-col gap-2">
              {signedIn ? (
                <Button asChild variant="paper" size="sm" className="w-full">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm" className="w-full text-ink-text hover:bg-paper-line">
                    <Link href="/auth/sign-in">Sign in</Link>
                  </Button>
                  <Button asChild variant="paper" size="sm" className="w-full">
                    <Link href="/auth/sign-up">Get started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}