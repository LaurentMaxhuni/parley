"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "@phosphor-icons/react";

export function CTA({ signedIn }: { signedIn: boolean }) {
  return (
    <section id="pricing" className="py-32 md:py-48 px-6 md:px-10 bg-ink relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brass/5 via-transparent to-sage/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brass/10 blur-3xl" />
      
      <div className="relative mx-auto max-w-4xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-cream mb-6"
        >
          Know your price.
          <br />
          <span className="italic text-brass">Hold the line.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-text max-w-2xl mx-auto mb-10"
        >
          Join freelancers and small teams who've stopped undercharging and started negotiating from strength.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button asChild size="lg" variant="paper" className="group min-w-[220px]">
            <Link href={signedIn ? "/pricing" : "/auth/sign-up"}>
              {signedIn ? "Open Pricing Advisor" : "Start free — no card required"}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-cream/30 text-cream hover:bg-ink-soft min-w-[220px]">
            <Link href={signedIn ? "/negotiate" : "/auth/sign-in"}>{signedIn ? "Draft a counter-offer" : "Sign in to dashboard"}</Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 text-sm text-slate-text/60"
        >
          Free tier includes 10 pricing sessions/month, 5 negotiations/month, full dashboard history.
        </motion.p>
      </div>
    </section>
  );
}
