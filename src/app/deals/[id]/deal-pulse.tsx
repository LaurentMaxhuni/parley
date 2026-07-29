"use client";

import { useState } from "react";
import { CalendarDots, CheckCircle, ClipboardText, PaperPlaneTilt, ShieldCheck } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DealStatus = "LEAD" | "PROPOSAL_SENT" | "NEGOTIATING" | "WON" | "LOST";
type FollowUpTone = "warm" | "direct" | "decisive";

type Props = {
  clientName: string;
  title: string;
  status: DealStatus;
  targetCloseDate: string | null;
  proposalCount: number;
  scopeChangeCount: number;
  hasPaymentSchedule: boolean;
  today: string;
};

function datePressure(targetCloseDate: string | null, today: string) {
  if (!targetCloseDate) return { label: "No target close date", weight: 0 };
  const todayStart = Date.parse(today.slice(0, 10));
  const targetStart = Date.parse(targetCloseDate.slice(0, 10));
  const days = Math.ceil((targetStart - todayStart) / 86_400_000);
  if (days < 0) return { label: `Target date passed (${targetCloseDate.slice(0, 10)})`, weight: -18 };
  if (days === 0) return { label: "Target close date is today", weight: -8 };
  if (days <= 3) return { label: `${days} day${days === 1 ? "" : "s"} to target close`, weight: -3 };
  return { label: `Target close ${targetCloseDate.slice(0, 10)}`, weight: 4 };
}

function confidence(props: Props) {
  const baseline: Record<DealStatus, number> = { LEAD: 36, PROPOSAL_SENT: 56, NEGOTIATING: 70, WON: 100, LOST: 0 };
  if (props.status === "WON" || props.status === "LOST") return baseline[props.status];
  const pressure = datePressure(props.targetCloseDate, props.today);
  return Math.max(8, Math.min(94, baseline[props.status] + Math.min(12, props.proposalCount * 8) + (props.hasPaymentSchedule ? 7 : 0) + (props.scopeChangeCount > 0 ? 3 : 0) + pressure.weight));
}

function closeSteps(status: DealStatus, proposalCount: number, hasPaymentSchedule: boolean) {
  if (status === "WON") return ["Confirm the kick-off date and first milestone.", "Send the selected payment schedule.", "Archive the key decisions in the workspace."];
  if (status === "LOST") return ["Record why the opportunity did not close.", "Thank the client and leave the door open.", "Reuse the learning in your next proposal."];
  if (status === "LEAD") return ["Confirm the problem, decision-maker, and buying window.", proposalCount ? "Choose the pricing position that fits the client." : "Run Pricing Advisor and pick a clear commercial position.", "Agree the next decision point before you send anything."];
  if (status === "PROPOSAL_SENT") return ["Confirm the proposal reached the right people.", "Ask what they need to decide, rather than checking in vaguely.", hasPaymentSchedule ? "Keep the payment schedule ready for the yes." : "Prepare payment terms before the client says yes."];
  return ["Write down the trade-offs you can accept before replying.", "Protect scope, price, and timeline together.", "Turn the agreed terms into a clear written next step."];
}

function makeFollowUp({ clientName, title, status, tone }: Pick<Props, "clientName" | "title" | "status"> & { tone: FollowUpTone }) {
  const opener = tone === "warm"
    ? `Hi ${clientName},\n\nI hope your week is going well.`
    : tone === "direct"
    ? `Hi ${clientName},\n\nI’m following up on ${title}.`
    : `Hi ${clientName},\n\nI’d like to confirm the decision on ${title}.`;

  const ask = status === "LEAD"
    ? "Would a short call this week help us confirm the scope, timing, and best way to move forward?"
    : status === "PROPOSAL_SENT"
    ? "Have you had a chance to review the proposal? I’m happy to clarify anything that would help you make a decision."
    : status === "NEGOTIATING"
    ? "If the current terms work for you, I can send the final scope and payment schedule today. If not, tell me which point needs attention."
    : status === "WON"
    ? "I’m looking forward to getting started. Please confirm the preferred kick-off date and I’ll send the first-step details."
    : "Thank you again for considering the work. If the timing changes, I’d be glad to reconnect.";

  const close = tone === "decisive" && !["WON", "LOST"].includes(status)
    ? "Could you let me know by Friday whether you’d like to proceed?"
    : "Best,\n";

  return `${opener}\n\n${ask}\n\n${close}`;
}

export function DealPulse(props: Props) {
  const [tone, setTone] = useState<FollowUpTone>("warm");
  const [message, setMessage] = useState(() => makeFollowUp({ ...props, tone: "warm" }));
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const score = confidence(props);
  const pressure = datePressure(props.targetCloseDate, props.today);
  const steps = closeSteps(props.status, props.proposalCount, props.hasPaymentSchedule);

  function updateTone(nextTone: FollowUpTone) {
    setTone(nextTone);
    setMessage(makeFollowUp({ ...props, tone: nextTone }));
    setCopied(false);
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setCopyError(null);
    } catch {
      setCopyError("Copying failed. Select the text and copy it manually.");
    }
  }

  return (
    <section className="mt-8 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <Card className="border-brass/25 bg-brass/5">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div><p className="font-mono text-xs tracking-[0.14em] text-brass">DEAL PULSE</p><CardTitle className="mt-2">Close confidence</CardTitle></div>
            <span className="font-mono text-3xl text-cream">{score}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-1" aria-label={`Close confidence ${score} out of 100`}>
            {Array.from({ length: 10 }, (_, index) => <span key={index} className={`h-2 rounded-sm ${index < Math.ceil(score / 10) ? "bg-brass" : "bg-ink-line"}`} />)}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-text">A practical signal based on stage, proposal coverage, payment readiness, scope decisions, and the target date. It is a working prompt, not a forecast.</p>
          <div className="mt-5 space-y-3 border-t border-ink-line pt-4 text-sm">
            <p className="flex items-start gap-2 text-cream/90"><CalendarDots className="mt-0.5 h-4 w-4 shrink-0 text-brass" />{pressure.label}</p>
            <p className="flex items-start gap-2 text-cream/90"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage" />{props.hasPaymentSchedule ? "Payment schedule ready" : "Payment schedule not selected"}</p>
            <p className="flex items-start gap-2 text-cream/90"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brass-soft" />{props.proposalCount ? `${props.proposalCount} saved proposal version${props.proposalCount === 1 ? "" : "s"}` : "No proposal version yet"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><p className="font-mono text-xs tracking-[0.14em] text-sage">CLOSE PLAN</p><CardTitle className="mt-2">The three moves that matter now</CardTitle></CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {steps.map((step, index) => <li key={step} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sage/35 font-mono text-xs text-sage">{index + 1}</span><p className="pt-0.5 text-sm leading-relaxed text-cream/90">{step}</p></li>)}
          </ol>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><PaperPlaneTilt className="h-5 w-5 text-brass" /><CardTitle>Follow-up composer</CardTitle></div><p className="mt-2 text-sm text-slate-text">A concrete message from this deal’s current stage. Adjust it freely before sending.</p></div><div className="min-w-36"><Label htmlFor="follow-up-tone">Tone</Label><select id="follow-up-tone" value={tone} onChange={(event) => updateTone(event.target.value as FollowUpTone)} className="mt-2 h-9 w-full rounded-md border border-ink-line bg-ink px-2 text-sm text-cream"><option value="warm">Warm</option><option value="direct">Direct</option><option value="decisive">Decision-focused</option></select></div></div></CardHeader>
        <CardContent><Textarea aria-label="Follow-up message" value={message} onChange={(event) => { setMessage(event.target.value); setCopied(false); }} className="min-h-40 whitespace-pre-wrap text-sm leading-relaxed" /><div className="mt-4 flex flex-wrap items-center gap-3"><Button type="button" variant="outline" onClick={copyMessage}><ClipboardText className="h-4 w-4" />{copied ? "Copied" : "Copy follow-up"}</Button>{copyError && <p role="alert" className="text-sm text-redline">{copyError}</p>}</div></CardContent>
      </Card>
    </section>
  );
}
