"use client";

import { useAuthStore } from "@/stores/auth-store";
import { OperatorDashboard } from "@/components/dashboard/OperatorDashboard";
// import { SupervisorDashboard } from "@/components/dashboard/SupervisorDashboard";
// import { MachineInchargeDashboard } from "@/components/dashboard/MachineInchargeDashboard";
// import { FleetManagerDashboard } from "@/components/dashboard/FleetManagerDashboard";
// import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  switch (user.role) {
    case "operator":
      return <OperatorDashboard />;
    // case "supervisor":
    //   return <SupervisorDashboard />;
    // case "machine_incharge":
    //   return <MachineInchargeDashboard />;
    // case "fleet_manager":
    //   return <FleetManagerDashboard />;
    // case "admin":
    //   return <AdminDashboard />;
    default:
      return (
        <div className="p-10 text-sm text-zinc-500">
          Unknown role: {user.role}
        </div>
      );
  }
}
