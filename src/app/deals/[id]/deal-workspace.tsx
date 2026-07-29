"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clipboard, FileText, LoaderCircle, Scale, ShieldCheck, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DealPulse } from "./deal-pulse";

type Tier = { name: string; price: string };
type PricingSession = { id: string; label: string; tiers: Tier[] };
type LinkedSession = { id: string; label: string; type: "PRICING" | "NEGOTIATION"; createdAt: string };
type Proposal = { id: string; version: number; tierName: string; tierPrice: string; scope: string; timeline: string; exclusions: string; content: string; updatedAt: string };
type ScopeOutput = { assessment: "in_scope" | "change_order" | "needs_review"; reasoning: string; priceImpact: string; timelineImpact: string; changeOrderMessage: string };
type ScopeChange = { id: string; request: string; approvedScope: string; status: "RECOMMENDED" | "APPROVED" | "DECLINED"; output: ScopeOutput; createdAt: string };
type PaymentOutput = { summary: string; milestones: { label: string; percentage: number; trigger: string }[]; latePaymentTerms: string; cancellationTerms: string; clientSummary: string };
type PaymentSchedule = { id: string; contractValueCents: number; currency: string; timeline: string; riskPreference: string; output: PaymentOutput; updatedAt: string };

type Props = {
  deal: { id: string; clientName: string; title: string; status: "LEAD" | "PROPOSAL_SENT" | "NEGOTIATING" | "WON" | "LOST"; quotedValueCents: number | null; currency: string; notes: string; targetCloseDate: string | null };
  pricingSessions: PricingSession[];
  unlinkedSessions: LinkedSession[];
  linkedSessions: LinkedSession[];
  proposals: Proposal[];
  scopeChanges: ScopeChange[];
  selectedPaymentSchedule: PaymentSchedule | null;
  today: string;
};

const statusLabels = { LEAD: "Lead", PROPOSAL_SENT: "Proposal sent", NEGOTIATING: "Negotiating", WON: "Won", LOST: "Lost" } as const;

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

async function copy(text: string) {
  await navigator.clipboard.writeText(text);
}

export function DealWorkspace(props: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(props.deal.status);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [linkId, setLinkId] = useState("");
  const [linking, setLinking] = useState(false);

  async function updateStatus(nextStatus: Props["deal"]["status"]) {
    setStatus(nextStatus);
    setStatusError(null);
    const response = await fetch(`/api/deals/${props.deal.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
    if (!response.ok) {
      setStatusError("Status could not be saved.");
      setStatus(props.deal.status);
      return;
    }
    router.refresh();
  }

  async function linkSession() {
    if (!linkId) return;
    setLinking(true);
    try {
      const response = await fetch(`/api/deals/${props.deal.id}/sessions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: linkId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setLinkId("");
      router.refresh();
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Session could not be linked.");
    } finally {
      setLinking(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink px-6 py-10 lg:px-10 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-ink-line pb-8">
          <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="font-mono text-xs tracking-[0.16em] text-brass">{props.deal.clientName.toUpperCase()}</p><h1 className="mt-3 font-display text-4xl tracking-[-0.04em] text-cream md:text-5xl">{props.deal.title}</h1><p className="mt-3 max-w-2xl text-slate-text">{props.deal.notes || "Keep the client context, commercial decisions, and ready-to-send language together."}</p></div><div className="min-w-44"><Label htmlFor="deal-status">Deal status</Label><select id="deal-status" value={status} onChange={(event) => updateStatus(event.target.value as Props["deal"]["status"])} className="mt-2 h-10 w-full rounded-md border border-ink-line bg-ink-soft px-3 text-sm text-cream"><option value="LEAD">Lead</option><option value="PROPOSAL_SENT">Proposal sent</option><option value="NEGOTIATING">Negotiating</option><option value="WON">Won</option><option value="LOST">Lost</option></select><p className="mt-2 text-xs text-slate-text">{statusLabels[status]}</p></div></div>
          {statusError && <p role="alert" className="mt-4 text-sm text-redline">{statusError}</p>}
        </header>

        <DealPulse
          clientName={props.deal.clientName}
          title={props.deal.title}
          status={status}
          targetCloseDate={props.deal.targetCloseDate}
          proposalCount={props.proposals.length}
          scopeChangeCount={props.scopeChanges.length}
          hasPaymentSchedule={Boolean(props.selectedPaymentSchedule)}
          today={props.today}
        />

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <Card><CardHeader><CardTitle className="text-base">Quoted value</CardTitle></CardHeader><CardContent className="font-mono text-xl text-cream">{props.deal.quotedValueCents === null ? "Not set" : money(props.deal.quotedValueCents, props.deal.currency)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Proposal versions</CardTitle></CardHeader><CardContent className="font-mono text-xl text-cream">{props.proposals.length}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Scope decisions</CardTitle></CardHeader><CardContent className="font-mono text-xl text-cream">{props.scopeChanges.length}</CardContent></Card>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <ProposalBuilder dealId={props.deal.id} pricingSessions={props.pricingSessions} />
            <ScopeChangeGuard dealId={props.deal.id} defaultScope={props.proposals[0]?.scope ?? props.deal.notes} changes={props.scopeChanges} />
          </div>
          <div className="space-y-6">
            <PaymentTermsPlanner dealId={props.deal.id} initialValue={props.deal.quotedValueCents} currency={props.deal.currency} selectedSchedule={props.selectedPaymentSchedule} />
            <SessionLinker linkedSessions={props.linkedSessions} unlinkedSessions={props.unlinkedSessions} linkId={linkId} setLinkId={setLinkId} onLink={linkSession} loading={linking} />
          </div>
        </section>

        <section className="mt-10"><div className="mb-4 flex items-center gap-2"><FileText className="h-5 w-5 text-brass" /><h2 className="font-display text-2xl text-cream">Proposal versions</h2></div>{props.proposals.length === 0 ? <Empty label="Draft a proposal from a saved pricing tier or your own terms." /> : <div className="space-y-4">{props.proposals.map((proposal) => <ProposalEditor key={proposal.id} dealId={props.deal.id} proposal={proposal} />)}</div>}</section>
      </div>
    </main>
  );
}

function ProposalBuilder({ dealId, pricingSessions }: { dealId: string; pricingSessions: PricingSession[] }) {
  const router = useRouter();
  const [pricingSessionId, setPricingSessionId] = useState("");
  const [tierName, setTierName] = useState("Custom engagement");
  const [tierPrice, setTierPrice] = useState("");
  const [scope, setScope] = useState("");
  const [timeline, setTimeline] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tiers = useMemo(() => pricingSessions.find((session) => session.id === pricingSessionId)?.tiers ?? [], [pricingSessionId, pricingSessions]);

  function chooseSession(id: string) {
    setPricingSessionId(id);
    const firstTier = pricingSessions.find((session) => session.id === id)?.tiers[0];
    if (firstTier) { setTierName(firstTier.name); setTierPrice(firstTier.price); }
  }

  async function generate(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError(null);
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "proposal", payload: { dealId, pricingSessionId: pricingSessionId || undefined, tierName, tierPrice, scope, timeline, exclusions } }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Could not create the proposal.");
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create the proposal."); }
    finally { setLoading(false); }
  }

  return <Card className="border-brass/25 bg-brass/5"><CardHeader><div className="flex items-center gap-2"><FileText className="h-5 w-5 text-brass" /><CardTitle>Proposal &amp; SOW builder</CardTitle></div><p className="text-sm text-slate-text">Use a saved pricing recommendation or enter terms manually. The resulting text stays editable.</p></CardHeader><CardContent><form onSubmit={generate} className="grid gap-4"><div className="flex flex-col gap-2"><Label htmlFor="pricing-source">Start from Pricing Advisor (optional)</Label><select id="pricing-source" value={pricingSessionId} onChange={(event) => chooseSession(event.target.value)} className="h-10 rounded-md border border-ink-line bg-ink px-3 text-sm text-cream"><option value="">Custom terms</option>{pricingSessions.map((session) => <option key={session.id} value={session.id}>{session.label}</option>)}</select></div>{tiers.length > 0 && <div className="flex flex-col gap-2"><Label htmlFor="proposal-tier">Recommended tier</Label><select id="proposal-tier" value={tierName} onChange={(event) => { const tier = tiers.find((item) => item.name === event.target.value); setTierName(event.target.value); if (tier) setTierPrice(tier.price); }} className="h-10 rounded-md border border-ink-line bg-ink px-3 text-sm text-cream">{tiers.map((tier) => <option key={tier.name} value={tier.name}>{tier.name} — {tier.price}</option>)}</select></div>}<div className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label htmlFor="tier-name">Package / tier</Label><Input id="tier-name" required value={tierName} onChange={(event) => setTierName(event.target.value)} /></div><div className="flex flex-col gap-2"><Label htmlFor="tier-price">Investment</Label><Input id="tier-price" required value={tierPrice} onChange={(event) => setTierPrice(event.target.value)} placeholder="$5,000 flat" /></div></div><div className="flex flex-col gap-2"><Label htmlFor="proposal-scope">Scope of work</Label><Textarea id="proposal-scope" required minLength={10} value={scope} onChange={(event) => setScope(event.target.value)} placeholder="Deliverables, responsibility, and outcome..." /></div><div className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label htmlFor="proposal-timeline">Timeline</Label><Input id="proposal-timeline" required value={timeline} onChange={(event) => setTimeline(event.target.value)} placeholder="Four weeks from kickoff" /></div><div className="flex flex-col gap-2"><Label htmlFor="proposal-exclusions">Exclusions</Label><Input id="proposal-exclusions" value={exclusions} onChange={(event) => setExclusions(event.target.value)} placeholder="Optional: extra revisions, paid media..." /></div></div><div className="flex flex-wrap items-center gap-3"><Button type="submit" disabled={loading}>{loading && <LoaderCircle className="h-4 w-4 animate-spin" />}{loading ? "Drafting..." : "Create proposal"}</Button>{error && <p role="alert" className="text-sm text-redline">{error}</p>}</div></form></CardContent></Card>;
}

function ProposalEditor({ dealId, proposal }: { dealId: string; proposal: Proposal }) {
  const [content, setContent] = useState(proposal.content);
  const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false); const [error, setError] = useState<string | null>(null); const [copied, setCopied] = useState(false);
  async function save() { setSaving(true); setError(null); try { const response = await fetch(`/api/deals/${dealId}/proposals/${proposal.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setSaved(true); } catch (err) { setError(err instanceof Error ? err.message : "Could not save the proposal."); } finally { setSaving(false); } }
  return <Card><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><CardTitle>{proposal.tierName}</CardTitle><Badge>v{proposal.version}</Badge></div><p className="mt-1 font-mono text-sm text-brass-soft">{proposal.tierPrice} · {proposal.timeline}</p></div><p className="text-xs text-slate-text">Updated {new Date(proposal.updatedAt).toLocaleDateString()}</p></div></CardHeader><CardContent><Textarea aria-label={`Proposal version ${proposal.version}`} value={content} onChange={(event) => { setContent(event.target.value); setSaved(false); }} className="min-h-72 whitespace-pre-wrap font-mono text-sm leading-relaxed" /><div className="mt-4 flex flex-wrap items-center gap-3"><Button type="button" variant="outline" onClick={save} disabled={saving}>{saving ? "Saving..." : saved ? <><Check className="h-4 w-4" />Saved</> : "Save edits"}</Button><Button type="button" variant="ghost" onClick={async () => { await copy(content); setCopied(true); }}><Clipboard className="h-4 w-4" />{copied ? "Copied" : "Copy proposal"}</Button>{error && <p role="alert" className="text-sm text-redline">{error}</p>}</div><p className="mt-4 text-xs text-slate-text">Commercial guidance only—not legal advice. Review the terms before sending.</p></CardContent></Card>;
}

function ScopeChangeGuard({ dealId, defaultScope, changes }: { dealId: string; defaultScope: string; changes: ScopeChange[] }) {
  const router = useRouter(); const [approvedScope, setApprovedScope] = useState(defaultScope); const [request, setRequest] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  async function assess(event: FormEvent) { event.preventDefault(); setLoading(true); setError(null); try { const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "scope_change", payload: { dealId, approvedScope, request } }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Could not assess the change."); setRequest(""); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : "Could not assess the change."); } finally { setLoading(false); } }
  return <Card><CardHeader><div className="flex items-center gap-2"><Scale className="h-5 w-5 text-redline" /><CardTitle>Scope-change guard</CardTitle></div><p className="text-sm text-slate-text">Compare a new client ask against the agreed work before you answer.</p></CardHeader><CardContent><form onSubmit={assess} className="grid gap-4"><div className="flex flex-col gap-2"><Label htmlFor="approved-scope">Approved scope</Label><Textarea id="approved-scope" required minLength={10} value={approvedScope} onChange={(event) => setApprovedScope(event.target.value)} placeholder="Start with a proposal scope or record the agreed work here." /></div><div className="flex flex-col gap-2"><Label htmlFor="change-request">New client request</Label><Textarea id="change-request" required minLength={10} value={request} onChange={(event) => setRequest(event.target.value)} placeholder="Paste the new deliverable, revision, or deadline request." /></div><div className="flex flex-wrap items-center gap-3"><Button type="submit" variant="redline" disabled={loading}>{loading && <LoaderCircle className="h-4 w-4 animate-spin" />}{loading ? "Checking..." : "Check scope"}</Button>{error && <p role="alert" className="text-sm text-redline">{error}</p>}</div></form>{changes.length > 0 && <div className="mt-6 space-y-3 border-t border-ink-line pt-5">{changes.map((change) => <ScopeChangeCard key={change.id} dealId={dealId} change={change} />)}</div>}</CardContent></Card>;
}

function ScopeChangeCard({ dealId, change }: { dealId: string; change: ScopeChange }) {
  const router = useRouter(); const [updating, setUpdating] = useState(false); const [copied, setCopied] = useState(false);
  async function setStatus(status: ScopeChange["status"]) { setUpdating(true); try { const response = await fetch(`/api/deals/${dealId}/scope-changes/${change.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); if (!response.ok) throw new Error(); router.refresh(); } finally { setUpdating(false); } }
  const verdict = change.output.assessment === "change_order" ? "Change order" : change.output.assessment === "in_scope" ? "In scope" : "Review needed";
  return <div className="rounded-lg border border-ink-line bg-ink/30 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><Badge variant={change.output.assessment === "change_order" ? "redline" : change.output.assessment === "in_scope" ? "sage" : "default"}>{verdict}</Badge><span className="text-xs text-slate-text">{change.status.toLowerCase()}</span></div><p className="mt-3 text-sm text-cream">{change.request}</p></div><p className="text-xs text-slate-text">{new Date(change.createdAt).toLocaleDateString()}</p></div><p className="mt-3 text-sm text-slate-text">{change.output.reasoning}</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><p className="rounded bg-ink-soft/60 p-2 text-xs text-cream"><span className="text-slate-text">Price: </span>{change.output.priceImpact}</p><p className="rounded bg-ink-soft/60 p-2 text-xs text-cream"><span className="text-slate-text">Timeline: </span>{change.output.timelineImpact}</p></div><p className="mt-3 whitespace-pre-wrap rounded bg-ink-soft/40 p-3 text-sm leading-relaxed text-cream/90">{change.output.changeOrderMessage}</p><div className="mt-3 flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={async () => { await copy(change.output.changeOrderMessage); setCopied(true); }}><Clipboard className="h-3.5 w-3.5" />{copied ? "Copied" : "Copy reply"}</Button><Button type="button" size="sm" disabled={updating || change.status === "APPROVED"} onClick={() => setStatus("APPROVED")}>Approve change</Button><Button type="button" size="sm" variant="ghost" disabled={updating || change.status === "DECLINED"} onClick={() => setStatus("DECLINED")}>Decline</Button></div></div>;
}

function PaymentTermsPlanner({ dealId, initialValue, currency, selectedSchedule }: { dealId: string; initialValue: number | null; currency: string; selectedSchedule: PaymentSchedule | null }) {
  const router = useRouter(); const [value, setValue] = useState(initialValue ? String(initialValue / 100) : ""); const [timeline, setTimeline] = useState(selectedSchedule?.timeline ?? ""); const [riskPreference, setRiskPreference] = useState("balanced"); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null); const [copied, setCopied] = useState(false);
  async function createSchedule(event: FormEvent) { event.preventDefault(); setLoading(true); setError(null); const contractValueCents = Math.round(Number(value) * 100); if (!Number.isFinite(contractValueCents) || contractValueCents < 1) { setError("Enter a contract value greater than zero."); setLoading(false); return; } try { const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "payment_terms", payload: { dealId, contractValueCents, currency, timeline, riskPreference } }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Could not create payment terms."); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : "Could not create payment terms."); } finally { setLoading(false); } }
  return <Card className="border-sage/30"><CardHeader><div className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-sage" /><CardTitle>Payment-terms planner</CardTitle></div><p className="text-sm text-slate-text">Create a protected payment schedule and client-ready terms summary.</p></CardHeader><CardContent><form onSubmit={createSchedule} className="grid gap-4"><div className="flex flex-col gap-2"><Label htmlFor="contract-value">Contract value ({currency})</Label><Input id="contract-value" required inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} placeholder="5000" /></div><div className="flex flex-col gap-2"><Label htmlFor="payment-timeline">Project timeline</Label><Input id="payment-timeline" required value={timeline} onChange={(event) => setTimeline(event.target.value)} placeholder="Six weeks" /></div><div className="flex flex-col gap-2"><Label htmlFor="risk-preference">Risk preference</Label><select id="risk-preference" value={riskPreference} onChange={(event) => setRiskPreference(event.target.value)} className="h-10 rounded-md border border-ink-line bg-ink px-3 text-sm text-cream"><option value="balanced">Balanced</option><option value="protective">Protective</option><option value="flexible">Flexible</option></select></div><div className="flex flex-wrap items-center gap-3"><Button type="submit" disabled={loading}>{loading && <LoaderCircle className="h-4 w-4 animate-spin" />}{loading ? "Planning..." : "Build payment terms"}</Button>{error && <p role="alert" className="text-sm text-redline">{error}</p>}</div></form>{selectedSchedule && <div className="mt-6 border-t border-ink-line pt-5"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-sage" /><p className="font-mono text-xs text-sage">SELECTED SCHEDULE</p></div><p className="mt-3 text-sm text-cream/90">{selectedSchedule.output.summary}</p><div className="mt-4 space-y-2">{selectedSchedule.output.milestones.map((milestone) => <div key={`${milestone.label}-${milestone.percentage}`} className="rounded bg-ink/40 p-3"><div className="flex justify-between gap-3 text-sm text-cream"><span>{milestone.label}</span><span className="font-mono text-brass-soft">{milestone.percentage}% · {money(Math.round(selectedSchedule.contractValueCents * milestone.percentage / 100), selectedSchedule.currency)}</span></div><p className="mt-1 text-xs text-slate-text">{milestone.trigger}</p></div>)}</div><div className="mt-4 space-y-3 text-sm"><p><span className="text-slate-text">Late payment: </span><span className="text-cream/90">{selectedSchedule.output.latePaymentTerms}</span></p><p><span className="text-slate-text">Cancellation: </span><span className="text-cream/90">{selectedSchedule.output.cancellationTerms}</span></p></div><Button type="button" size="sm" variant="outline" className="mt-4" onClick={async () => { await copy(selectedSchedule.output.clientSummary); setCopied(true); }}><Clipboard className="h-3.5 w-3.5" />{copied ? "Copied" : "Copy client summary"}</Button><p className="mt-3 text-xs text-slate-text">Commercial guidance only—not legal advice.</p></div>}</CardContent></Card>;
}

function SessionLinker({ linkedSessions, unlinkedSessions, linkId, setLinkId, onLink, loading }: { linkedSessions: LinkedSession[]; unlinkedSessions: LinkedSession[]; linkId: string; setLinkId: (value: string) => void; onLink: () => Promise<void>; loading: boolean }) {
  return <Card><CardHeader><CardTitle className="text-base">Linked Parley sessions</CardTitle><p className="text-sm text-slate-text">Keep the pricing and negotiation history that informs this deal nearby.</p></CardHeader><CardContent>{linkedSessions.length > 0 && <div className="mb-4 space-y-2">{linkedSessions.map((session) => <div key={session.id} className="rounded border border-ink-line bg-ink/30 p-3"><p className="text-sm text-cream">{session.label}</p><p className="mt-1 font-mono text-xs text-slate-text">{session.type.toLowerCase()} · {new Date(session.createdAt).toLocaleDateString()}</p></div>)}</div>}{unlinkedSessions.length > 0 ? <div className="flex gap-2"><select value={linkId} onChange={(event) => setLinkId(event.target.value)} className="h-9 min-w-0 flex-1 rounded-md border border-ink-line bg-ink px-2 text-xs text-cream"><option value="">Link saved session…</option>{unlinkedSessions.map((session) => <option key={session.id} value={session.id}>{session.label}</option>)}</select><Button type="button" size="sm" disabled={!linkId || loading} onClick={onLink}>{loading ? "Linking..." : "Link"}</Button></div> : linkedSessions.length === 0 ? <p className="text-sm text-slate-text">Run Pricing Advisor or Negotiate first, then link those sessions here.</p> : null}</CardContent></Card>;
}

function Empty({ label }: { label: string }) { return <Card className="border-dashed"><CardContent className="py-10 text-center text-sm text-slate-text">{label}</CardContent></Card>; }
