import Link from "next/link";
import { getAuth } from "@/lib/auth/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const { data: session } = await getAuth().getSession();
  const signedIn = Boolean(session?.user);

  return (
    <div className="min-h-screen bg-paper text-ink-text">
      <nav className="flex items-center justify-between border-b border-paper-line px-6 py-4 md:px-10">
        <span className="font-display text-lg italic">Parley</span>
        <div className="flex gap-2">
          {signedIn ? (
            <Button asChild variant="paper" size="sm">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-ink-text hover:bg-paper-line">
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button asChild variant="paper" size="sm">
                <Link href="/auth/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-20 md:px-10">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-brass">
          Pricing &amp; negotiation copilot
        </p>
        <h1 className="font-display text-4xl leading-tight md:text-6xl">
          Know what to charge.
          <br />
          <span className="italic">Hold the line</span> when they push back.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink-text/80">
          Freelancers and small businesses lose money twice: once by
          under-pricing, and again by folding the moment a client says
          &ldquo;can you do it for less?&rdquo; Parley helps with both.
        </p>

        <div className="mt-8 flex gap-3">
          <Button asChild size="lg" variant="paper">
            <Link href={signedIn ? "/pricing" : "/auth/sign-up"}>Try the Pricing Advisor</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-ink-text/30 text-ink-text hover:bg-paper-line">
            <Link href={signedIn ? "/negotiate" : "/auth/sign-up"}>Draft a counter-offer</Link>
          </Button>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-2">
          <Card className="border-paper-line bg-white/40">
            <CardHeader>
              <CardTitle className="text-ink-text">Pricing Advisor</CardTitle>
              <CardDescription className="text-ink-text/70">
                Describe what you sell and who it&apos;s for. Get back tiered
                pricing with the reasoning behind it — not just a number
                pulled from thin air.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-ink-text/70">
              Best for: setting prices before a client conversation starts.
            </CardContent>
          </Card>

          <Card className="border-paper-line bg-white/40">
            <CardHeader>
              <CardTitle className="text-ink-text">Negotiation Counter-Generator</CardTitle>
              <CardDescription className="text-ink-text/70">
                Paste what the client said. Get a Deal Health Score, a clear
                verdict, and a ready-to-send reply that protects your margin.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-ink-text/70">
              Best for: the moment right after they push back.
            </CardContent>
          </Card>
        </div>

        <p className="mt-16 text-xs text-ink-text/50">
          Every request is routed to a different AI model depending on how
          complex or high-stakes it is — see the Dashboard for exactly which
          model handled each of your requests.
        </p>
      </main>
    </div>
  );
}
