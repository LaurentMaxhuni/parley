"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import {
  House,
  CurrencyCircleDollar,
  ChatTeardropText,
  Calculator,
  SignOut,
  Sparkle,
  List,
  X
} from "@phosphor-icons/react";
import { useState } from "react";

const navItems = [
  { icon: House, label: "Overview", href: "/dashboard" },
  { icon: CurrencyCircleDollar, label: "Pricing Advisor", href: "/pricing" },
  { icon: ChatTeardropText, label: "Negotiate", href: "/negotiate" },
  { icon: Calculator, label: "Rate Calculator", href: "/calculator" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-ink-soft rounded-lg border border-ink-line text-cream hover:text-brass transition-colors"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 w-[280px] bg-ink border-r border-ink-line flex flex-col transition-transform duration-300 ease-out",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-ink-line">
          <Link href="/" className="font-display text-xl italic text-cream hover:text-brass transition-colors">
            Parley
          </Link>
          <p className="text-xs text-slate-text mt-1">Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === "/dashboard" && pathname === "/dashboard");
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brass/10 text-brass border border-brass/20"
                    : "text-slate-text hover:text-cream hover:bg-ink-soft"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-brass" : "text-slate-text")} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brass" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ink-line">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-brass/10 flex items-center justify-center">
              <Sparkle className="h-4 w-4 text-brass" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cream truncate">Free Tier</p>
              <p className="text-xs text-slate-text">10 pricing / 5 nego/mo</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-slate-text hover:text-cream hover:bg-ink-soft"
            onClick={() => authClient.signOut().then(() => (window.location.href = "/"))}
          >
            <SignOut className="h-5 w-5" />
            <span>Sign out</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
