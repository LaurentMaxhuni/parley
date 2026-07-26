"use client";

import { motion } from "framer-motion";
import { ChartLine, Check, EnvelopeSimple, Lightbulb, Lightning, PencilSimple } from "@phosphor-icons/react";

const steps = [
  { icon: PencilSimple, title: "Describe the work", body: "Add the service, client, timeline, and constraints that shape the value of the engagement." },
  { icon: Lightbulb, title: "Set three strong price points", body: "See a defensible floor, target, and stretch price with the rationale behind each one." },
  { icon: EnvelopeSimple, title: "Bring the pushback", body: "Paste the message when a client asks for a discount or changes the terms." },
  { icon: Lightning, title: "Reply with leverage", body: "Get a deal-health read and a clear response that protects scope, price, and tone." },
  { icon: ChartLine, title: "Build your playbook", body: "Your previous decisions stay organized, so each new conversation starts smarter." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-paper px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-3xl md:mb-24"
        >
          <h2 className="font-display text-4xl leading-[1.02] tracking-[-0.035em] text-ink md:text-6xl">
            From first number to a signed agreement, without the guesswork.
          </h2>
        </motion.div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-paper-line bg-paper-line md:grid-cols-5">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="group min-h-72 bg-paper p-6 transition-colors duration-500 hover:bg-white md:p-7"
            >
              <step.icon className="mb-12 h-7 w-7 text-brass transition-transform duration-500 group-hover:scale-110" aria-hidden="true" />
              <p className="mb-3 font-mono text-xs tracking-[0.18em] text-brass">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="font-display text-2xl leading-tight text-ink">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">{step.body}</p>
              <div className="mt-6 flex items-center gap-2 text-xs text-sage"><Check className="h-4 w-4" /> Clear next step</div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
