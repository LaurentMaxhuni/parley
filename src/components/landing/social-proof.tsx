"use client";

import { motion } from "framer-motion";
import { ChartLineUp, LockKey, TextAlignLeft } from "@phosphor-icons/react";

const principles = [
  {
    icon: ChartLineUp,
    title: "A price you can explain",
    body: "Move from a single nervous number to a clear range, with the logic that supports it.",
  },
  {
    icon: TextAlignLeft,
    title: "Language that keeps the relationship intact",
    body: "Turn an awkward reply into a practical next step without performing confidence you do not feel.",
  },
  {
    icon: LockKey,
    title: "A private record of your decisions",
    body: "Keep the context, reasoning, and outcomes from past conversations close when the next opportunity arrives.",
  },
];

export function SocialProof() {
  return (
    <section className="border-y border-paper-line bg-white/50 px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-display text-4xl leading-[1.02] tracking-[-0.035em] text-ink md:text-6xl"
          >
            A sharper way to have the conversations that set your business up.
          </motion.h2>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-paper-line bg-paper-line sm:grid-cols-3">
            {principles.map((principle, index) => (
              <motion.article
                key={principle.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="group bg-paper p-6 transition-colors duration-500 hover:bg-white"
              >
                <principle.icon className="h-7 w-7 text-brass transition-transform duration-500 group-hover:scale-110" aria-hidden="true" />
                <h3 className="mt-16 font-display text-2xl text-ink">{principle.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{principle.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
