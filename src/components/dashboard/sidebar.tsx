"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";
import {
  House,
  CurrencyCircleDollar,
  ChatTeardropText,
  Calculator,
  SignOut,
  List,
  X,
  CaretUp,
  UserCircle,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { icon: House, label: "Overview", href: "/dashboard" },
  { icon: CurrencyCircleDollar, label: "Pricing Advisor", href: "/pricing" },
  { icon: ChatTeardropText, label: "Negotiate", href: "/negotiate" },
  { icon: Calculator, label: "Rate Calculator", href: "/calculator" },
];

interface SessionUser {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    authClient.getSession().then((res: unknown) => {
      const r = res as { data?: { user?: SessionUser } | null };
      if (r?.data?.user) setUser(r.data.user);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email
    ? user.email[0].toUpperCase()
    : "?";

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
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-display text-xl italic text-cream hover:text-brass transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 32 32" className="shrink-0">
              <defs>
                <linearGradient id="pl" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#b08d57" />
                  <stop offset="100%" stopColor="#d8c39a" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="14.5" fill="#141d33" stroke="url(#pl)" strokeWidth="1.5" />
              <text
                x="16"
                y="21.5"
                textAnchor="middle"
                fill="url(#pl)"
                fontFamily="Georgia, serif"
                fontSize="18"
                fontWeight="600"
                fontStyle="italic"
              >
                P
              </text>
            </svg>
            Parley
          </Link>
          <p className="text-xs text-slate-text mt-1">Dashboard</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/dashboard" && pathname === "/dashboard");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-r from-brass/12 to-transparent text-brass border border-brass/15"
                    : "text-slate-text hover:text-cream hover:bg-ink-soft/80"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-gradient-to-b from-brass to-brass-soft/60" />
                )}
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    isActive ? "text-brass" : "text-slate-text group-hover:scale-110"
                  )}
                  weight={isActive ? "fill" : "regular"}
                />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brass" />
                )}
              </Link>
            );
          })}
        </nav>

        <div ref={profileRef} className="relative p-4 border-t border-ink-line">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-ink-soft/60 text-left"
          >
            {user?.image ? (
              <img
                src={user.image}
                alt=""
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="h-9 w-9 rounded-full ring-2 ring-ink-line object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brass/20 to-brass/5 ring-1 ring-brass/20 text-brass-soft font-mono text-sm font-medium">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cream truncate">
                {user?.name || user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-slate-text truncate">
                {user?.email || ""}
              </p>
            </div>
            <CaretUp
              className={cn(
                "h-4 w-4 text-slate-text transition-transform duration-200",
                profileOpen ? "rotate-0" : "rotate-180"
              )}
            />
          </button>

          {profileOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 rounded-xl border border-ink-line bg-ink-soft shadow-2xl shadow-ink/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-ink-line">
                <p className="text-xs text-slate-text">Signed in as</p>
                <p className="text-sm text-cream truncate">{user?.email || "—"}</p>
              </div>
              <button
                onClick={() =>
                  authClient
                    .signOut()
                    .then(() => (window.location.href = "/"))
                }
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-text hover:text-redline hover:bg-redline/5 transition-colors"
              >
                <SignOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
