import Link from "next/link";
import { Envelope } from "@phosphor-icons/react";

const productLinks = [
  { label: "Pricing Advisor", href: "/pricing" },
  { label: "Negotiation Counter", href: "/negotiate" },
  { label: "Dashboard", href: "/dashboard" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-paper-line bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="font-display text-xl italic text-ink">Parley</Link>
            <p className="mt-4 max-w-xs text-ink/70">Pricing and negotiation support for independent businesses that want to make their work count.</p>
          </div>
          <div>
            <h2 className="font-mono text-xs tracking-[0.18em] text-brass">PRODUCT</h2>
            <ul className="mt-5 space-y-3">
              {productLinks.map((link) => <li key={link.label}><Link href={link.href} className="text-sm text-ink/70 transition-colors hover:text-brass">{link.label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h2 className="font-mono text-xs tracking-[0.18em] text-brass">CONTACT</h2>
            <a href="mailto:hello@parley.app" className="mt-5 inline-flex items-center gap-2 text-sm text-ink/70 transition-colors hover:text-brass"><Envelope className="h-4 w-4" /> hello@parley.app</a>
          </div>
        </div>
        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-paper-line pt-8 text-sm text-ink/50 md:flex-row">
          <p>© {currentYear} Parley. All rights reserved.</p>
          <p className="font-mono">Built with Next.js, Neon Auth, Prisma, and OpenRouter</p>
        </div>
      </div>
    </footer>
  );
}
