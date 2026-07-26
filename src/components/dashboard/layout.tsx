"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink">
      <DashboardSidebar />
      
      <main className="lg:ml-[280px] min-h-screen">
        {children}
      </main>
    </div>
  );
}