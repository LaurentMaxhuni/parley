"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PricingResponse } from "@/lib/prompts";

interface Routing {
  tier: string;
  reason: string;
  modelUsed: string;
}

export function PricingForm() {
  const [description, setDescription] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PricingResponse | null>(null);
  const [routing, setRouting] = useState<Routing | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setRouting(null);
    setWarning(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pricing",
          payload: { description, targetMarket, competitors },
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setResult(data.result);
      setRouting(data.routing);
      setWarning(data.warning ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">What do you sell?</Label>
          <Textarea
            id="description"
            required
            maxLength={4000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Brand identity packages for early-stage startups — logo, type system, and a small style guide, delivered in 2 weeks."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="targetMarket">Who's it for?</Label>
          <Input
            id="targetMarket"
            required
            maxLength={500}
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            placeholder="e.g. Pre-seed founders, 2-8 person teams"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="competitors">Competitors or comparable offerings (optional)</Label>
          <Input
            id="competitors"
            value={competitors}
            maxLength={1000}
            onChange={(e) => setCompetitors(e.target.value)}
            placeholder="e.g. 99designs, freelance designers on Upwork"
          />
        </div>

        <Button type="submit" disabled={loading} size="lg">
          {loading ? "Thinking…" : "Get pricing"}
        </Button>
      </form>

      {error && <p role="alert" className="text-sm text-redline">{error}</p>}
      {warning && <p role="status" className="text-sm text-brass-soft">{warning}</p>}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-4"
          >
            {routing && (
              <Badge className="w-fit">
                {routing.modelUsed} · {routing.tier} tier
              </Badge>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              {result.tiers.map((tier, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>{tier.name}</CardTitle>
                    <p className="font-mono text-2xl text-brass-soft">{tier.price}</p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <p className="text-xs uppercase tracking-wide text-slate-text">
                      Best for
                    </p>
                    <p className="text-sm text-cream/90">{tier.bestFor}</p>
                    <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-text">
                      {tier.features.map((f, j) => (
                        <li key={j}>· {f}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Positioning copy</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-cream/90">{result.positioningCopy}</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why this pricing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-text">{result.reasoning}</CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
