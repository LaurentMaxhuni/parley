"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight, ChatTeardropText, Copy, ShieldCheck } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DealHealthGauge } from "@/components/deal-health-gauge";

import { ScrubWords } from "@/components/results/scrub-words";
import { HorizontalAccordion } from "@/components/results/horizontal-accordion";

import type { NegotiationResponse, TradeoffResponse } from "@/lib/prompts";

interface Routing { tier: string; reason: string; modelUsed: string; }
const verdictLabel: Record<NegotiationResponse["verdict"], string> = {
  hold_firm: "Hold firm",
  counter: "Send a counter",
  compromise: "Compromise",
  walk_away: "Walk away",
};
const verdictAccent: Record<NegotiationResponse["verdict"], string> = {
  hold_firm: "#4c7a5e",
  counter: "#b08d57",
  compromise: "#d8c39a",
  walk_away: "#c1402a",
};

export function NegotiateForm() {
  const [yourAsk, setYourAsk] = useState("");
  const [clientMessage, setClientMessage] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NegotiationResponse | null>(null);
  const [routing, setRouting] = useState<Routing | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fieldsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !fieldsRef.current) return;
    gsap.fromTo(
      fieldsRef.current.children,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out", delay: 0.25 }
    );
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
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.3 }
      );
    }
  }, [result]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null); setRouting(null); setWarning(null); setCopied(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "negotiation", payload: { yourAsk, clientMessage, context } }),
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
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-redline/3 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-3 text-redline mb-6">
            <ChatTeardropText className="h-6 w-6" weight="duotone" />
          </div>
          <h2 className="max-w-5xl font-display text-4xl leading-[0.98] tracking-[-0.04em] text-cream md:text-5xl">
            Keep the deal moving without giving away your leverage.
          </h2>
          <div className="mt-5 max-w-xl">
            <ScrubWords
              text="Add the exact message and the context around it. Parley helps you respond with clarity, not reflex."
              className="text-base leading-relaxed text-slate-text"
            />
          </div>
          <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-7">
            <div ref={fieldsRef} className="flex flex-col gap-7">
              <div className="flex flex-col gap-2">
                <Label htmlFor="yourAsk">What did you quote?</Label>
                <Input id="yourAsk" required maxLength={500} value={yourAsk} onChange={(e) => setYourAsk(e.target.value)} placeholder="Your original price, terms, or scope" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="clientMessage">What did the client say?</Label>
                <Textarea id="clientMessage" required maxLength={4000} value={clientMessage} onChange={(e) => setClientMessage(e.target.value)} className="min-h-48 resize-y" placeholder="Paste their message as closely as you can." />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="context">Anything else that matters?</Label>
                <Input id="context" maxLength={2000} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Optional: relationship, deadline, alternatives, or constraints" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button type="submit" variant="redline" disabled={loading} size="lg" className="min-w-52">
                {loading ? "Reading the room..." : "Build my counter"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-xs text-slate-text">Your context stays in your private history.</p>
            </div>
            {error && <p role="alert" className="text-sm text-redline">{error}</p>}
            {warning && <p role="status" className="text-sm text-brass-soft">{warning}</p>}
          </form>
        </div>
      </div>

      <aside className="relative bg-ink-soft/35 px-6 py-10 lg:col-span-5 lg:px-10 lg:py-16 xl:px-14">
        <div className="pointer-events-none absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-redline/5 blur-3xl" />
        <div className="sticky top-28">
          {!result ? (
            <EmptyNegotiationResult loading={loading} />
          ) : (
            <div ref={resultRef} className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl text-cream">Your next move</h2>
                {routing && <Badge>{routing.modelUsed} · {routing.tier}</Badge>}
              </div>

              <div data-result-card className="rounded-2xl border border-ink-line bg-ink/40 py-4">
                <DealHealthGauge score={result.dealHealthScore} />
              </div>

              <Card data-result-card
                className="overflow-hidden transition-all duration-500 hover:border-brass/30"
                style={{ borderColor: `${verdictAccent[result.verdict]}40` }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: verdictAccent[result.verdict] }}
                    />
                    {verdictLabel[result.verdict]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-slate-text">
                  {result.reasoning}
                </CardContent>
              </Card>

              <Card data-result-card className="transition-all duration-500 hover:border-cream/20">
                <CardHeader>
                  <CardTitle>Your reply</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-cream/90">
                    {result.counterMessage}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-5"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(result.counterMessage);
                        setCopied(true);
                      } catch {
                        setError("Could not copy automatically. Select the reply and copy it manually.");
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy reply"}
                  </Button>
                </CardContent>
              </Card>

              <TradeoffComposer yourAsk={yourAsk} clientMessage={clientMessage} context={context} />
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}

function EmptyNegotiationResult({ loading }: { loading: boolean }) {
  return (
    <div className="flex min-h-96 flex-col justify-between rounded-2xl border border-ink-line bg-ink/40 p-7">
      <div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-redline/10">
          <ChatTeardropText className="h-6 w-6 text-redline" weight="duotone" />
        </div>
        <h2 className="mt-8 font-display text-3xl text-cream">
          {loading ? "Reading the room" : "Your response will take shape here."}
        </h2>
        <p className="mt-4 max-w-sm leading-relaxed text-slate-text">
          {loading
            ? "Assessing leverage, tone, and the most useful next move."
            : "The goal is a reply that protects your terms while leaving a productive path forward."}
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm text-brass-soft">
        <ShieldCheck className="h-4 w-4" />
        Deal health and a ready-to-send reply
      </div>
    </div>
  );
}

function TradeoffComposer({
  yourAsk,
  clientMessage,
  context,
}: {
  yourAsk: string;
  clientMessage: string;
  context: string;
}) {
  const [concession, setConcession] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tradeoff, setTradeoff] = useState<TradeoffResponse | null>(null);

  async function createTradeoff(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "tradeoff", payload: { yourAsk, clientMessage, context, concession } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create a trade-off.");
      setTradeoff(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create a trade-off.");
    } finally {
      setLoading(false);
    }
  }

  const tradeoffPanels = tradeoff
    ? [
        {
          label: "You give",
          accent: "#c1402a",
          content: <p className="text-sm text-cream/90">{tradeoff.give}</p>,
        },
        {
          label: "You get",
          accent: "#4c7a5e",
          content: <p className="text-sm text-cream/90">{tradeoff.get}</p>,
        },
        {
          label: "Rationale",
          accent: "#b08d57",
          content: <p className="text-sm leading-relaxed text-slate-text">{tradeoff.rationale}</p>,
        },
        {
          label: "Message",
          accent: "#d8c39a",
          content: (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-cream/90">
              {tradeoff.message}
            </p>
          ),
        },
      ]
    : [];

  return (
    <Card data-result-card className="border-brass/25 bg-brass/5">
      <CardHeader>
        <CardTitle>Protect the value with a trade-off</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-slate-text">
          Turn a discount, rush request, or added deliverable into a clear give-and-get instead of a one-way concession.
        </p>
        <form onSubmit={createTradeoff} className="mt-4 flex gap-2">
          <Input
            required
            value={concession}
            onChange={(e) => setConcession(e.target.value)}
            placeholder="e.g. They want 20% off"
          />
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Mapping..." : "Build trade-off"}
          </Button>
        </form>
        {error && <p role="alert" className="mt-3 text-sm text-redline">{error}</p>}
        {tradeoff && (
          <div className="mt-5 border-t border-brass/20 pt-5">
            <HorizontalAccordion panels={tradeoffPanels} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
