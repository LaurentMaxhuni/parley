import { requireUser } from "@/lib/auth/guard";
import { PricingForm } from "./pricing-form";
import { DollarSign } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  await requireUser();

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-ink">
      <main className="min-h-screen w-full max-w-full overflow-x-hidden">
        <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/80 px-6 py-5 backdrop-blur-lg lg:px-10">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-brass" />
            <div>
              <h1 className="font-display text-2xl text-cream">Pricing Advisor</h1>
              <p className="text-sm text-slate-text">Get tiered pricing with reasoning</p>
            </div>
          </div>
        </header>

        <PricingForm />
      </main>
    </div>
    </DashboardLayout>
  );
}
