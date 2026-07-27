"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { navItemsByRole } from "@/lib/nav-items";

const ROLE_LABELS: Record<string, string> = {
  operator: "Operator",
  supervisor: "Supervisor",
  machine_incharge: "Machine In-charge",
  fleet_manager: "Fleet Manager",
  admin: "Admin",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { accessToken, user } = useAuthStore();

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  if (!accessToken || !user) return null;

  const items = navItemsByRole[user.role] ?? [];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex min-h-screen min-w-0">
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex items-center gap-2 border-b border-border px-4 py-3">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground">
                {ROLE_LABELS[user.role] ?? user.role} Dashboard
              </span>
            </header>
            <main className="min-w-0 flex-1 p-6">{children}</main>
          </div>
          <NotificationsPanel />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
