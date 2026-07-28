"use client";

import { useAuthStore } from "@/stores/auth-store";
import OperatorDashboard from "@/components/dashboard/OperatorDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  switch (user.role) {
    case "operator":
      return <OperatorDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return (
        <div className="p-10 text-sm text-zinc-500">
          Unknown role: {user.role}
        </div>
      );
  }
}
