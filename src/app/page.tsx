import { getAuth } from "@/lib/auth/server";
import { LandingContent } from "@/components/landing/content";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const { data: session } = await getAuth().getSession();
  const signedIn = Boolean(session?.user);

  return (
    <div className="min-h-screen bg-paper text-ink-text">
      <LandingContent signedIn={signedIn} />
    </div>
  );
}
