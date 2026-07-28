"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function DealForm() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [targetCloseDate, setTargetCloseDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createDeal(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const quotedValueCents = value.trim() ? Math.round(Number(value) * 100) : null;
    if (quotedValueCents !== null && (!Number.isFinite(quotedValueCents) || quotedValueCents < 0)) {
      setError("Enter a valid quoted value.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          title,
          quotedValueCents,
          currency: "USD",
          targetCloseDate: targetCloseDate || null,
          notes,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not create the deal.");
      router.push(`/deals/${data.deal.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the deal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={createDeal} className="grid gap-4 rounded-xl border border-ink-line bg-ink-soft/45 p-5 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="client-name">Client name</Label>
        <Input id="client-name" required maxLength={160} value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Northstar Studio" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="deal-title">Deal title</Label>
        <Input id="deal-title" required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Brand strategy engagement" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="quoted-value">Quoted value (optional)</Label>
        <Input id="quoted-value" inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} placeholder="5000" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="target-close">Target close date</Label>
        <Input id="target-close" type="date" value={targetCloseDate} onChange={(event) => setTargetCloseDate(event.target.value)} />
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="deal-notes">Notes</Label>
        <Textarea id="deal-notes" maxLength={5000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What matters most about this opportunity?" />
      </div>
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <Button type="submit" disabled={loading}>{loading ? "Opening workspace..." : "Create deal"}</Button>
        {error && <p role="alert" className="text-sm text-redline">{error}</p>}
      </div>
    </form>
  );
}
