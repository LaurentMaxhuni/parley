"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight, CheckCircle, CurrencyCircleDollar, ChartLineUp } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardStacker } from "@/components/results/card-stacker";

import { ScrubWords } from "@/components/results/scrub-words";
import type { PricingResponse } from "@/lib/prompts";

interface Routing { tier: string; reason: string; modelUsed: string; }

export function PricingForm() {
  const [description, setDescription] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PricingResponse | null>(null);
  const [routing, setRouting] = useState<Routing | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const fieldsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    if (fieldsRef.current) {
      gsap.fromTo(
        fieldsRef.current.children,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out", delay: 0.25 }
      );
    }
  }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      gsap.fromTo(
        resultRef.current,
        { autoAlpha: 0, scale: 0.95, y: 30 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: "power4.out" }
      );

      gsap.fromTo(
        resultRef.current.querySelectorAll("[data-result-card]"),
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.3 }
      );
    }
  }, [result]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null); setRouting(null); setWarning(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pricing", payload: { description, targetMarket, competitors } }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setResult(data.result); setRouting(data.routing); setWarning(data.warning ?? null);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100dvh-83px)] w-full max-w-[1600px] grid-flow-dense grid-cols-1 lg:grid-cols-12">
      <div className="relative border-b border-ink-line px-6 py-10 lg:col-span-7 lg:border-b-0 lg:border-r lg:px-14 lg:py-16 xl:px-20">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-brass/3 blur-3xl" />
        <div ref={formRef} className="relative max-w-3xl">
          <div className="flex items-center gap-3 text-brass mb-6">
            <CurrencyCircleDollar className="h-6 w-6" weight="duotone" />
          </div>
          <h2 className="max-w-5xl font-display text-4xl leading-[0.98] tracking-[-0.04em] text-cream md:text-5xl">
            Price the work with a clear point of view.
          </h2>
          <div className="mt-5 max-w-xl">
            <ScrubWords
              text="Give Parley the shape of the engagement. You will get a range you can stand behind, plus language to put it into the proposal."
              className="text-base leading-relaxed text-slate-text"
            />
          </div>
          <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-7">
            <div ref={fieldsRef} className="flex flex-col gap-7">
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">What are you selling?</Label>
                <Textarea id="description" required maxLength={4000} value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-40 resize-y" placeholder="Describe the scope, deliverables, timeline, and outcome your client is buying." />
              </div>
              <div className="grid gap-7 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="targetMarket">Who is it for?</Label>
                  <Input id="targetMarket" required maxLength={500} value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder="Client type or stage" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="competitors">Comparable offers</Label>
                  <Input id="competitors" maxLength={1000} value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder="Optional context" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button type="submit" disabled={loading} size="lg" className="min-w-52">
                {loading ? "Building your range..." : "Build my pricing"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-xs text-slate-text">A response is saved to your private history.</p>
            </div>
            {error && <p role="alert" className="text-sm text-redline">{error}</p>}
            {warning && <p role="status" className="text-sm text-brass-soft">{warning}</p>}
          </form>
        </div>
      </div>

      <aside className="relative bg-ink-soft/35 px-6 py-10 lg:col-span-5 lg:px-10 lg:py-16 xl:px-14">
        <div className="pointer-events-none absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-brass/5 blur-3xl" />
        <div className="sticky top-28">
          {!result ? (
            <EmptyPricingResult loading={loading} />
          ) : (
            <div ref={resultRef}>
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl text-cream">Your price range</h2>
                {routing && <Badge>{routing.modelUsed} · {routing.tier}</Badge>}
              </div>
              <div className="space-y-4">
                <CardStacker>
                  {result.tiers.map((tier) => (
                    <Card key={`${tier.name}-${tier.price}`} data-result-card className="group overflow-hidden border-ink-line/60 transition-all duration-500 hover:border-brass/30 hover:-translate-y-0.5">
                      <CardHeader className="border-b border-ink-line/40 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-lg">{tier.name}</CardTitle>
                          <p className="font-mono text-xl text-brass-soft">{tier.price}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5">
                        <p className="text-sm text-cream/90">{tier.bestFor}</p>
                        <ul className="mt-4 space-y-2 text-sm text-slate-text">
                          {tier.features.map((feature) => (
                            <li key={feature} className="flex gap-2">
                              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </CardStacker>
                <Card data-result-card className="border-brass/20 bg-brass/5">
                  <CardHeader>
                    <CardTitle className="text-base">Positioning copy</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-relaxed text-cream/90">
                    {result.positioningCopy}
                  </CardContent>
                </Card>
                <p data-result-card className="text-sm leading-relaxed text-slate-text">
                  {result.reasoning}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}

function EmptyPricingResult({ loading }: { loading: boolean }) {
  return (
    <div className="flex min-h-96 flex-col justify-between rounded-2xl border border-ink-line bg-ink/40 p-7">
      <div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brass/10">
          <CurrencyCircleDollar className="h-6 w-6 text-brass" weight="duotone" />
        </div>
        <h2 className="mt-8 font-display text-3xl text-cream">
          {loading ? "Finding the right range" : "Your recommendation will appear here."}
        </h2>
        <p className="mt-4 max-w-sm leading-relaxed text-slate-text">
          {loading
            ? "Looking at the scope, buyer, and market context you provided."
            : "A good price has room for the work, the risk, and the value your client takes away."}
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm text-brass-soft">
        <ChartLineUp className="h-4 w-4" />
        Floor, target, and stretch
      </div>
    </div>
  );
}
