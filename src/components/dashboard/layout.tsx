"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink">
      <DashboardSidebar />
      <main className="min-h-screen min-w-0 overflow-x-clip lg:ml-[280px]">{children}</main>
    </div>
  );
}
