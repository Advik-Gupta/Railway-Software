"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const ROLE_LABELS: Record<string, string> = {
  operator: "Operator",
  supervisor: "Supervisor",
  machine_incharge: "Machine In-charge",
  fleet_manager: "Fleet Manager",
  admin: "Admin",
};

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-zinc-900">
          Railway Portal
        </span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
          {ROLE_LABELS[user.role] ?? user.role}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-500">{user.full_name}</span>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
