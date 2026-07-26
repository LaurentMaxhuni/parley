"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight, ChartLineUp, CheckCircle, CurrencyCircleDollar } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      gsap.fromTo(resultRef.current, { autoAlpha: 0, scale: 0.97, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.55, ease: "power3.out" });
    }
  }, [result]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null); setRouting(null); setWarning(null);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "pricing", payload: { description, targetMarket, competitors } }) });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setResult(data.result); setRouting(data.routing); setWarning(data.warning ?? null);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100dvh-83px)] w-full max-w-[1600px] grid-flow-dense grid-cols-1 lg:grid-cols-12">
      <div className="border-b border-ink-line px-6 py-10 lg:col-span-7 lg:border-b-0 lg:border-r lg:px-10 lg:py-14 xl:px-14">
        <div className="max-w-3xl">
          <h2 className="max-w-2xl font-display text-4xl leading-[0.98] tracking-[-0.04em] text-cream md:text-5xl">Price the work with a clear point of view.</h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-text">Give Parley the shape of the engagement. You will get a range you can stand behind, plus language to put it into the proposal.</p>
          <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-7">
            <div className="flex flex-col gap-2"><Label htmlFor="description">What are you selling?</Label><Textarea id="description" required maxLength={4000} value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-40 resize-y" placeholder="Describe the scope, deliverables, timeline, and outcome your client is buying." /></div>
            <div className="grid gap-7 md:grid-cols-2">
              <div className="flex flex-col gap-2"><Label htmlFor="targetMarket">Who is it for?</Label><Input id="targetMarket" required maxLength={500} value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder="Client type or stage" /></div>
              <div className="flex flex-col gap-2"><Label htmlFor="competitors">Comparable offers</Label><Input id="competitors" maxLength={1000} value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder="Optional context" /></div>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2"><Button type="submit" disabled={loading} size="lg" className="min-w-52">{loading ? "Building your range..." : "Build my pricing"}<ArrowRight className="h-4 w-4" /></Button><p className="text-xs text-slate-text">A response is saved to your private history.</p></div>
            {error && <p role="alert" className="text-sm text-redline">{error}</p>}{warning && <p role="status" className="text-sm text-brass-soft">{warning}</p>}
          </form>
        </div>
      </div>
      <aside className="relative bg-ink-soft/35 px-6 py-10 lg:col-span-5 lg:px-8 lg:py-14 xl:px-10">
        <div className="sticky top-28">
          {!result ? <EmptyPricingResult loading={loading} /> : <div ref={resultRef} className="space-y-5">
            <div className="flex items-center justify-between gap-3"><h2 className="font-display text-2xl text-cream">Your price range</h2>{routing && <Badge>{routing.modelUsed} · {routing.tier}</Badge>}</div>
            <div className="grid gap-3">{result.tiers.map((tier) => <Card key={`${tier.name}-${tier.price}`} className="group overflow-hidden p-0 transition-transform duration-500 hover:-translate-y-1"><CardHeader className="border-b border-ink-line p-5"><div className="flex items-start justify-between gap-4"><CardTitle>{tier.name}</CardTitle><p className="font-mono text-xl text-brass-soft">{tier.price}</p></div></CardHeader><CardContent className="p-5"><p className="text-sm text-cream/90">{tier.bestFor}</p><ul className="mt-4 space-y-2 text-sm text-slate-text">{tier.features.map((feature) => <li key={feature} className="flex gap-2"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-sage" />{feature}</li>)}</ul></CardContent></Card>)}</div>
            <Card><CardHeader><CardTitle>Positioning copy</CardTitle></CardHeader><CardContent className="text-sm leading-relaxed text-cream/90">{result.positioningCopy}</CardContent></Card>
            <p className="text-sm leading-relaxed text-slate-text">{result.reasoning}</p>
          </div>}
        </div>
      </aside>
    </section>
  );
}

function EmptyPricingResult({ loading }: { loading: boolean }) {
  return <div className="flex min-h-96 flex-col justify-between rounded-2xl border border-ink-line bg-ink/40 p-7"><div><div className="flex h-11 w-11 items-center justify-center rounded-full bg-brass/10"><CurrencyCircleDollar className="h-6 w-6 text-brass" weight="duotone" /></div><h2 className="mt-8 font-display text-3xl text-cream">{loading ? "Finding the right range" : "Your recommendation will appear here."}</h2><p className="mt-4 max-w-sm leading-relaxed text-slate-text">{loading ? "Looking at the scope, buyer, and market context you provided." : "A good price has room for the work, the risk, and the value your client takes away."}</p></div><div className="flex items-center gap-2 text-sm text-brass-soft"><ChartLineUp className="h-4 w-4" /> Floor, target, and stretch</div></div>;
}
