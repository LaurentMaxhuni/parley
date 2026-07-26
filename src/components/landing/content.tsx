"use client";

import dynamic from "next/dynamic";

const LandingNav = dynamic(
  () => import("@/components/landing/nav").then((mod) => mod.LandingNav),
  { ssr: false }
);

const Hero = dynamic(
  () => import("@/components/landing/hero").then((mod) => mod.Hero),
  { ssr: false }
);

const ProblemSolution = dynamic(
  () => import("@/components/landing/problem-solution").then((mod) => mod.ProblemSolution),
  { ssr: false }
);

const HowItWorks = dynamic(
  () => import("@/components/landing/how-it-works").then((mod) => mod.HowItWorks),
  { ssr: false }
);

const Features = dynamic(
  () => import("@/components/landing/features").then((mod) => mod.Features),
  { ssr: false }
);

const SocialProof = dynamic(
  () => import("@/components/landing/social-proof").then((mod) => mod.SocialProof),
  { ssr: false }
);

const CTA = dynamic(
  () => import("@/components/landing/cta").then((mod) => mod.CTA),
  { ssr: false }
);

const Footer = dynamic(
  () => import("@/components/landing/footer").then((mod) => mod.Footer),
  { ssr: false }
);

interface LandingContentProps {
  signedIn: boolean;
}

export function LandingContent({ signedIn }: LandingContentProps) {
  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <LandingNav signedIn={signedIn} />
      <Hero signedIn={signedIn} />
      <ProblemSolution />
      <HowItWorks />
      <Features />
      <SocialProof />
      <CTA signedIn={signedIn} />
      <Footer />
    </main>
  );
}
