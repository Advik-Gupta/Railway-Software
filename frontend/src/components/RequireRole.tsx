"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, type Role } from "@/stores/auth-store";

interface RequireRoleProps {
  roles: Role[];
  children: React.ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && !roles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, roles, router]);

  if (!user || !roles.includes(user.role)) return null;

  return <>{children}</>;
}
