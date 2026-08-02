"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage } from "@/lib/auth/errors";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Briefcase,
  Calculator,
  CaretDown,
  CaretUp,
  ChatTeardropText,
  CurrencyCircleDollar,
  House,
  List,
  Plus,
  Question,
  SignOut,
  Sparkle,
  X,
} from "@phosphor-icons/react";

const navGroups = [
  {
    label: "Workspace",
    items: [
      { icon: House, label: "Overview", href: "/dashboard", description: "Review recent advice and active client work." },
      { icon: Briefcase, label: "Deals", href: "/deals", description: "Move each client opportunity from lead to signed work." },
    ],
  },
  {
    label: "Decision tools",
    items: [
      { icon: CurrencyCircleDollar, label: "Pricing Advisor", href: "/pricing", description: "Turn an offer into clear, defendable price options." },
      { icon: ChatTeardropText, label: "Negotiate", href: "/negotiate", description: "Draft a confident response to a client’s message." },
      { icon: Calculator, label: "Rate Calculator", href: "/calculator", description: "Work out the rate that supports your income target." },
      { icon: BookOpen, label: "Playbook", href: "/playbook", description: "Reuse your strongest pricing and negotiation moves." },
    ],
  },
] as const;

const quickActions = [
  { icon: Plus, label: "Start a deal", hint: "Create a client workspace", href: "/deals#open-deal" },
  { icon: CurrencyCircleDollar, label: "Price an offer", hint: "Build your pricing position", href: "/pricing" },
  { icon: ChatTeardropText, label: "Prepare a reply", hint: "Respond to a client message", href: "/negotiate" },
] as const;

interface SessionUser {
  id: string;
  email?: string;
  name?: string;
  image?: string | null;
  picture?: string | null;
  user_metadata?: {
    profileImageUrl?: string | null;
  };
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const { data: session } = authClient.useSession();
  const user = session?.user as SessionUser | undefined;

  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Your account";
  const avatarUrl = user?.image || user?.picture || user?.user_metadata?.profileImageUrl || null;
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function closeSidebarMenus() {
    setMobileOpen(false);
    setQuickActionsOpen(false);
    setGuideOpen(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError(null);
    const { error } = await authClient.signOut();
    if (error) {
      setSignOutError(error.code === "INVALID_ORIGIN" ? authErrorMessage(error) : error.message || "Could not sign out. Please try again.");
      setSigningOut(false);
      return;
    }
    window.location.assign("/");
  }

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 rounded-lg border border-ink-line bg-ink-soft p-2 text-cream transition-colors hover:text-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60 lg:hidden"
        onClick={() => setMobileOpen((open) => !open)}
        aria-label="Toggle sidebar"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
      </button>

      {mobileOpen && <button type="button" aria-label="Close sidebar" className="fixed inset-0 z-30 bg-ink/50 backdrop-blur-sm lg:hidden" onClick={closeSidebarMenus} />}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col overflow-x-hidden border-r border-ink-line bg-ink transition-transform duration-300 ease-out lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="border-b border-ink-line p-6">
          <Link href="/dashboard" onClick={closeSidebarMenus} className="font-display text-xl italic text-cream transition-colors hover:text-brass">Parley</Link>
          <p className="mt-1 text-xs text-slate-text">Pricing and deal-closing workspace</p>
        </div>

        <nav aria-label="Main navigation" className="flex-1 space-y-6 overflow-y-auto p-4">
          <section className="rounded-xl border border-brass/20 bg-brass/5 p-2">
            <button
              type="button"
              onClick={() => { setQuickActionsOpen((open) => !open); setGuideOpen(false); }}
              aria-expanded={quickActionsOpen}
              aria-controls="quick-actions"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-cream transition-colors hover:bg-brass/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brass text-ink"><Plus className="h-4 w-4" weight="bold" /></span>
              <span className="min-w-0 flex-1"><span className="block">Start here</span><span className="mt-0.5 block text-xs font-normal text-slate-text">Open the next right tool</span></span>
              {quickActionsOpen ? <CaretUp className="h-4 w-4 text-brass" /> : <CaretDown className="h-4 w-4 text-slate-text" />}
            </button>
            {quickActionsOpen && <div id="quick-actions" className="space-y-1 border-t border-brass/15 pt-2">
              {quickActions.map((action) => <Link key={action.href} href={action.href} onClick={closeSidebarMenus} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60"><action.icon className="h-4 w-4 shrink-0 text-brass-soft" /><span className="min-w-0"><span className="block text-sm text-cream">{action.label}</span><span className="block truncate text-xs text-slate-text">{action.hint}</span></span></Link>)}
            </div>}
          </section>

          {navGroups.map((group) => (
            <section key={group.label} aria-labelledby={`nav-group-${group.label.replace(" ", "-")}`}>
              <p id={`nav-group-${group.label.replace(" ", "-")}`} className="mb-2 px-3 font-mono text-[10px] tracking-[0.16em] text-slate-text">{group.label.toUpperCase()}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeSidebarMenus}
                      title={item.description}
                      aria-label={`${item.label}: ${item.description}`}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group flex min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60",
                        isActive ? "border border-brass/20 bg-brass/10 text-brass" : "text-slate-text hover:bg-ink-soft hover:text-cream"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-brass" : "text-slate-text transition-colors group-hover:text-brass-soft")} />
                      <span className="min-w-0 flex-1"><span className="block truncate">{item.label}</span>{isActive && <span className="mt-0.5 block truncate text-[11px] font-normal text-slate-text">{item.description}</span>}</span>
                      {isActive && <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}

          <section className="rounded-xl border border-ink-line bg-ink-soft/35 p-2">
            <button
              type="button"
              onClick={() => { setGuideOpen((open) => !open); setQuickActionsOpen(false); }}
              aria-expanded={guideOpen}
              aria-controls="deal-flow-guide"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-text transition-colors hover:bg-ink-soft hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60"
            >
              <Question className="h-5 w-5 text-brass-soft" />
              <span className="min-w-0 flex-1"><span className="block font-medium text-cream">How Parley works</span><span className="mt-0.5 block text-xs">A simple deal-to-close flow</span></span>
              {guideOpen ? <CaretUp className="h-4 w-4 text-brass" /> : <CaretDown className="h-4 w-4" />}
            </button>
            {guideOpen && <ol id="deal-flow-guide" className="space-y-3 border-t border-ink-line px-3 pb-2 pt-4 text-xs leading-relaxed text-slate-text">
              <li className="flex gap-2"><span className="font-mono text-brass">01</span><span><strong className="font-medium text-cream">Price</strong> the work with a clear range and rationale.</span></li>
              <li className="flex gap-2"><span className="font-mono text-brass">02</span><span><strong className="font-medium text-cream">Open a deal</strong> to keep the client context and proposal together.</span></li>
              <li className="flex gap-2"><span className="font-mono text-brass">03</span><span><strong className="font-medium text-cream">Negotiate and protect</strong> scope, payment, and next steps.</span></li>
            </ol>}
          </section>
        </nav>

        <div className="relative border-t border-ink-line p-4">
          {profileOpen && (
            <div id="account-menu" role="menu" className="absolute bottom-full left-4 right-4 z-50 mb-2 overflow-hidden rounded-xl border border-ink-line bg-ink-soft shadow-[0_-16px_40px_rgba(6,10,15,0.42)]">
              <div className="flex min-w-0 items-center gap-3 p-4">
                {avatarUrl && !avatarFailed ? <img src={avatarUrl} alt={`${displayName} profile`} className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-brass/25" onError={() => setAvatarFailed(true)} /> : <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brass/10 font-mono text-sm font-medium text-brass-soft ring-1 ring-brass/20">{initials || <Sparkle className="h-4 w-4 text-brass" />}</div>}
                <div className="min-w-0"><p className="truncate text-sm font-medium text-cream">{displayName}</p><p className="truncate text-xs text-slate-text">{user?.email || "Signed-in account"}</p></div>
              </div>
              <div className="border-t border-ink-line p-2"><Button variant="ghost" size="sm" className="w-full justify-start gap-3 text-slate-text hover:bg-ink hover:text-cream" onClick={handleSignOut} disabled={signingOut} role="menuitem"><SignOut className="h-5 w-5" /><span>{signingOut ? "Signing out…" : "Sign out"}</span></Button>{signOutError && <p role="alert" className="px-2 pb-1 pt-2 text-xs leading-relaxed text-redline">{signOutError}</p>}</div>
            </div>
          )}

          <button type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-controls="account-menu" className="group flex w-full min-w-0 items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-colors hover:border-ink-line hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60">
            {avatarUrl && !avatarFailed ? <img src={avatarUrl} alt={`${displayName} profile`} className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-brass/25" onError={() => setAvatarFailed(true)} /> : <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/10 font-mono text-sm font-medium text-brass-soft ring-1 ring-brass/20">{initials || <Sparkle className="h-4 w-4 text-brass" />}</div>}
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-cream">{displayName}</p><p className="truncate text-xs text-slate-text">{user?.email || "Account"}</p></div>
            {profileOpen ? <CaretDown className="h-4 w-4 shrink-0 text-brass" /> : <CaretUp className="h-4 w-4 shrink-0 text-slate-text transition-colors group-hover:text-brass" />}
          </button>
        </div>
      </aside>
    </>
  );
}
