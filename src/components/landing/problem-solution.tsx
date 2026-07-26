"use client";

import { motion } from "framer-motion";
import { 
  CurrencyCircleDollar, 
  ChatTeardropText, 
  ShieldCheck, 
  Brain,
  ArrowRight,
  MagnifyingGlass,
  FileText,
  Sparkle
} from "@phosphor-icons/react";

const problems = [
  {
    icon: CurrencyCircleDollar,
    title: "Underpricing by default",
    desc: "Most freelancers guess at rates based on what feels safe, not what the market bears or what the work is worth.",
    stat: "47% undercharge by 30%+"
  },
  {
    icon: ChatTeardropText,
    title: "Folding under pressure",
    desc: "When a client pushes back, the instinct is to discount immediately — losing margin and signaling low confidence.",
    stat: "68% discount on first pushback"
  },
  {
    icon: ShieldCheck,
    title: "No repeatable process",
    desc: "Every new project starts from zero. No framework for pricing, no template for negotiation, no institutional memory.",
    stat: "Zero reusable assets"
  }
];

const solutions = [
  {
    icon: Brain,
    title: "Pricing Advisor",
    desc: "Describe your service and client. Get three tiered prices with reasoning — cost basis, market positioning, and value anchors.",
    highlight: "Model-routed: cheap model for simple scopes, premium for complex"
  },
  {
    icon: FileText,
    title: "Negotiation Counter-Generator",
    desc: "Paste the client's pushback. Get a Deal Health Score (0-100), a verdict (Walk Away / Counter / Hold Firm), and a ready-to-send reply.",
    highlight: "Tone-matched: professional, firm, not arrogant"
  },
  {
    icon: MagnifyingGlass,
    title: "Model transparency dashboard",
    desc: "Every request shows exactly which AI model handled it — GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro — with latency and token costs.",
    highlight: "No black box. You see the reasoning path."
  }
];

export function ProblemSolution() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10 bg-paper/50">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brass mb-4">
            The problem & the fix
          </p>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight text-ink">
            You're leaving money on the table
            <br />
            <span className="italic text-brass">twice</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {problems.map((problem, i) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-4 p-6 bg-white/30 border border-paper-line rounded-xl"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-ink/5 flex items-center justify-center">
                  <problem.icon className="h-6 w-6 text-ink" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-ink mb-2">{problem.title}</h3>
                  <p className="text-ink/70 mb-3">{problem.desc}</p>
                  <p className="font-mono text-sm text-brass">{problem.stat}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {solutions.map((solution, i) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-4 p-6 bg-ink/95 border border-ink-line rounded-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brass/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brass/10 flex items-center justify-center relative z-10">
                  <solution.icon className="h-6 w-6 text-brass" />
                </div>
                <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-display text-xl text-cream">{solution.title}</h3>
                    <Sparkle className="h-4 w-4 text-brass/60" />
                  </div>
                  <p className="text-slate-text mb-3">{solution.desc}</p>
                  <p className="font-mono text-xs text-brass-soft">{solution.highlight}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-ink-line ml-auto self-center transition-transform group-hover:translate-x-1" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}