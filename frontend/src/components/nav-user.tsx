"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronsUpDown } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { footerItemsByRole } from "@/lib/nav-items";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const ROLE_LABELS: Record<string, string> = {
  operator: "Operator",
  supervisor: "Supervisor",
  machine_incharge: "Machine In-charge",
  fleet_manager: "Fleet Manager",
  admin: "Admin",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function NavUser() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const footerItems = footerItemsByRole[user.role] ?? [];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">
                {initials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.full_name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
          >
            {/* Base UI requires DropdownMenuLabel to sit inside a
                DropdownMenuGroup — Radix didn't enforce this, Base UI does */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex flex-col px-1 py-1.5 text-left text-sm">
                  <span className="truncate font-medium">{user.full_name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {footerItems.map((item) =>
                item.action === "logout" ? (
                  <DropdownMenuItem
                    key={item.title}
                    onClick={() => {
                      logout();
                      router.push("/login");
                    }}
                  >
                    <item.icon />
                    {item.title}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    key={item.title}
                    render={<Link href={item.href!} />}
                  >
                    <item.icon />
                    {item.title}
                  </DropdownMenuItem>
                ),
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
