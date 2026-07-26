import { Nav } from "@/components/nav";
import { requireUser } from "@/lib/auth/guard";
import { PricingForm } from "./pricing-form";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  await requireUser();

  return (
    <div className="min-h-screen bg-ink">
      <Nav signedIn />
      <main className="mx-auto max-w-2xl px-6 py-12 md:px-10">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-brass">
          Pricing Advisor
        </p>
        <h1 className="mb-8 font-display text-3xl text-cream">
          What should you charge?
        </h1>
        <PricingForm />
      </main>
    </div>
  );
}
