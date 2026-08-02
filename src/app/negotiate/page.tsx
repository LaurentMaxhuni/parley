import { requireUser } from "@/lib/auth/guard";
import { NegotiateForm } from "./negotiate-form";
import { MessageSquare } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";

export const dynamic = "force-dynamic";

export default async function NegotiatePage() {
  await requireUser();

  return (
    <DashboardLayout>
      <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-ink">
        <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/80 px-6 py-5 backdrop-blur-lg lg:px-10">
          <div className="flex items-center gap-3 pl-12 lg:pl-0">
            <MessageSquare className="h-6 w-6 text-redline" />
            <div>
              <h1 className="font-display text-2xl text-cream">Negotiation Counter-Generator</h1>
              <p className="text-sm text-slate-text">They pushed back. Now what?</p>
            </div>
          </div>
        </header>

        <NegotiateForm />
      </main>
    </DashboardLayout>
  );
}
