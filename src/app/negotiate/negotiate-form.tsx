"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DealHealthGauge } from "@/components/deal-health-gauge";
import type { NegotiationResponse } from "@/lib/prompts";

interface Routing {
  tier: string;
  reason: string;
  modelUsed: string;
}

const VERDICT_LABEL: Record<NegotiationResponse["verdict"], string> = {
  hold_firm: "Hold firm",
  counter: "Send a counter",
  compromise: "Compromise",
  walk_away: "Walk away",
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setRouting(null);
    setWarning(null);
    setCopied(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "negotiation",
          payload: { yourAsk, clientMessage, context },
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
          <Label htmlFor="yourAsk">What did you ask for or quote?</Label>
          <Input
            id="yourAsk"
            required
            maxLength={500}
            value={yourAsk}
            onChange={(e) => setYourAsk(e.target.value)}
            placeholder="e.g. $4,500 flat for the full brand package"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="clientMessage">What did the client say back?</Label>
          <Textarea
            id="clientMessage"
            required
            maxLength={4000}
            value={clientMessage}
            onChange={(e) => setClientMessage(e.target.value)}
            placeholder="Paste their message as closely as you can…"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="context">Anything else worth knowing? (optional)</Label>
          <Input
            id="context"
            value={context}
            maxLength={2000}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. this is a repeat client, or you have no other work lined up"
          />
        </div>

        <Button type="submit" variant="redline" disabled={loading} size="lg">
          {loading ? "Reading the room…" : "Get my counter"}
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
            className="flex flex-col items-center gap-6"
          >
            {routing && (
              <Badge className="self-start">
                {routing.modelUsed} · {routing.tier} tier
              </Badge>
            )}

            <DealHealthGauge score={result.dealHealthScore} />

            <Card className="w-full">
              <CardHeader>
                <CardTitle>{VERDICT_LABEL[result.verdict]}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-text">{result.reasoning}</CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>Your reply</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-cream/90">{result.counterMessage}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(result.counterMessage);
                      setCopied(true);
                    } catch {
                      setError("Could not copy automatically. Select the reply and copy it manually.");
                    }
                  }}
                >
                  {copied ? "Copied" : "Copy reply"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
