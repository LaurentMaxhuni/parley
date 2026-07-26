"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "@phosphor-icons/react";

interface HeroProps {
  signedIn: boolean;
}

export function Hero({ signedIn }: HeroProps) {
  return (
    <section className="relative min-h-[85dvh] flex items-center justify-center px-6 md:px-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-brass)/10_0%,_transparent_70%)] pointer-events-none" />
      
      <div className="relative mx-auto w-full max-w-6xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="font-display text-[clamp(3rem,5vw,5.5rem)] leading-[0.98] tracking-[-0.045em] text-ink"
        >
          Know what to charge.
          <br />
          <span className="italic">Hold the line</span> when they push back.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-ink/70 leading-relaxed"
        >
          Freelancers and small businesses lose money twice: once by
          under-pricing, and again by folding the moment a client says
          &ldquo;can you do it for less?&rdquo; Parley helps with both.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button asChild size="lg" variant="paper" className="group w-full sm:w-auto min-w-[200px]">
            <Link href={signedIn ? "/pricing" : "/auth/sign-up"}>
              Try the Pricing Advisor
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto min-w-[200px] border-ink-text/30 text-ink-text hover:bg-paper-line"
          >
            <Link href={signedIn ? "/negotiate" : "/auth/sign-up"}>
              Draft a counter-offer
            </Link>
          </Button>
        </motion.div>

      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <svg className="h-6 w-6 text-ink/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}
