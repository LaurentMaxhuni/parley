"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Calculator,
  ChatTeardropText,
  CurrencyCircleDollar,
  House,
  List,
  SignOut,
  Sparkle,
  X,
} from "@phosphor-icons/react";

const navItems = [
  { icon: House, label: "Overview", href: "/dashboard" },
  { icon: CurrencyCircleDollar, label: "Pricing Advisor", href: "/pricing" },
  { icon: ChatTeardropText, label: "Negotiate", href: "/negotiate" },
  { icon: Briefcase, label: "Deals", href: "/deals" },
  { icon: Calculator, label: "Rate Calculator", href: "/calculator" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 rounded-lg border border-ink-line bg-ink-soft p-2 text-cream transition-colors hover:text-brass lg:hidden"
        onClick={() => setMobileOpen((open) => !open)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
      </button>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-ink-line bg-ink transition-transform duration-300 ease-out lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="border-b border-ink-line p-6">
          <Link href="/" className="font-display text-xl italic text-cream transition-colors hover:text-brass">Parley</Link>
          <p className="mt-1 text-xs text-slate-text">Dashboard</p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive ? "border border-brass/20 bg-brass/10 text-brass" : "text-slate-text hover:bg-ink-soft hover:text-cream"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-brass" : "text-slate-text")} />
                <span>{item.label}</span>
                {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brass" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-ink-line p-4">
          <div className="mb-2 flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brass/10"><Sparkle className="h-4 w-4 text-brass" /></div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-cream">Free Tier</p><p className="text-xs text-slate-text">10 pricing / 5 nego/mo</p></div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-3 text-slate-text hover:bg-ink-soft hover:text-cream" onClick={() => authClient.signOut().then(() => (window.location.href = "/"))}>
            <SignOut className="h-5 w-5" /><span>Sign out</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
