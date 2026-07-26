"use client";

import { motion } from "framer-motion";
import { 
  CurrencyCircleDollar,
  ChatTeardropText,
  Gauge,
  Brain,
  ShieldCheck,
  Clock,
  FileText,
  ChartBar,
  Sparkle,
  LockKey,
  Globe,
  ArrowRight
} from "@phosphor-icons/react";

const features = [
  {
    icon: CurrencyCircleDollar,
    title: "Tiered pricing with reasoning",
    desc: "Three price points — floor, target, stretch — each with cost basis, market data, and value anchors explained in plain English.",
    tag: "Pricing Advisor"
  },
  {
    icon: ChatTeardropText,
    title: "Ready-to-send counter messages",
    desc: "Professional, firm, not arrogant. Tone-matched to your style. Copy button built in. No wordsmithing required.",
    tag: "Negotiation"
  },
  {
    icon: Gauge,
    title: "Deal Health Score (0-100)",
    desc: "Instant read on whether to walk away, counter, or hold firm. Color-coded zones with clear thresholds.",
    tag: "Negotiation"
  },
  {
    icon: Brain,
    title: "Smart model routing",
    desc: "Simple scopes → fast/cheap models. Complex negotiations → reasoning models. You see exactly which model ran and why.",
    tag: "Platform"
  },
  {
    icon: FileText,
    title: "Full reasoning trail",
    desc: "Every output includes the model's step-by-step logic. Audit the thinking. Learn the patterns. Build your own playbook.",
    tag: "Platform"
  },
  {
    icon: ChartBar,
    title: "History dashboard",
    desc: "All past sessions searchable. Filter by type, model, score, date. Export data. See your pricing evolution over time.",
    tag: "Platform"
  },
  {
    icon: ShieldCheck,
    title: "Neon Auth — secure by default",
    desc: "Email/password + Google OAuth. Sessions in Neon Postgres. No auth code to maintain. Enterprise-grade without the enterprise work.",
    tag: "Security"
  },
  {
    icon: LockKey,
    title: "Your data, your database",
    desc: "Runs on your Neon Postgres. Sessions, history, preferences — all yours. No vendor lock-in on the data layer.",
    tag: "Security"
  },
  {
    icon: Globe,
    title: "Edge-ready, globally fast",
    desc: "Next.js 16 on Vercel Edge. Sub-100ms TTFB worldwide. Streaming responses. Works on mobile, desktop, tablet.",
    tag: "Performance"
  }
];

export function Features() {
  return (
    <section id="features" className="py-32 md:py-48 px-6 md:px-10 bg-paper/30">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brass mb-4">
            What you get
          </p>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight text-ink max-w-3xl mx-auto">
            Everything you need to <span className="italic">price confidently</span> and <span className="text-brass">negotiate professionally</span>
          </h2>
        </motion.div>

        <div className="grid grid-flow-dense gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative p-6 bg-white/50 border border-paper-line rounded-xl hover:border-brass/40 hover:shadow-xl hover:shadow-brass/10 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brass/10 flex items-center justify-center group-hover:bg-brass/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-brass" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-xs text-brass font-medium mb-2 block">
                    {feature.tag}
                  </span>
                  <h3 className="font-display text-lg text-ink mb-2 group-hover:text-brass transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-ink/70 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
              
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-5 w-5 text-brass/60" />
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brass mb-4 flex items-center justify-center gap-2">
            <Sparkle className="h-4 w-4" />
            Built with Next.js 16, Neon Auth, Prisma, GSAP, Chart.js
            <Sparkle className="h-4 w-4" />
          </p>
        </motion.div>
      </div>
    </section>
  );
}
