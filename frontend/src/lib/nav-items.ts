import {
  LayoutDashboard,
  Upload,
  ClipboardList,
  Settings,
  Users,
  MapPin,
  FileBarChart,
  ShieldCheck,
  User,
  LogOut,
  type LucideIcon,
} from "lucide-react";

export interface SidebarSubItem {
  title: string;
  href: string;
}

export interface SidebarNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  items?: SidebarSubItem[];
}

export const navItemsByRole: Record<string, SidebarNavItem[]> = {
  operator: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      title: "Uploads",
      href: "/dashboard/uploads",
      icon: Upload,
      items: [
        { title: "Pre-grinding", href: "/dashboard/uploads/pre-grinding" },
        { title: "Grinding", href: "/dashboard/uploads/grinding" },
        { title: "Post-grinding", href: "/dashboard/uploads/post-grinding" },
        {
          title: "Test Site Establishment",
          href: "/dashboard/uploads/test-site",
        },
      ],
    },
    {
      title: "Submissions",
      href: "/dashboard/submissions",
      icon: ClipboardList,
    },
  ],
  supervisor: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Review Queue", href: "/dashboard/review", icon: ShieldCheck },
    {
      title: "Submissions",
      href: "/dashboard/submissions",
      icon: ClipboardList,
    },
  ],
  machine_incharge: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Machines", href: "/dashboard/machines", icon: Settings },
    { title: "History", href: "/dashboard/history", icon: ClipboardList },
  ],
  fleet_manager: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Locations", href: "/dashboard/locations", icon: MapPin },
    { title: "Cycles", href: "/dashboard/cycles", icon: ClipboardList },
  ],
  admin: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: FileBarChart,
      items: [
        { title: "Generate Report", href: "/dashboard/reports/generate" },
        { title: "Report History", href: "/dashboard/reports/history" },
      ],
    },
    { title: "Users", href: "/dashboard/users", icon: Users },
    { title: "Audit Log", href: "/dashboard/audit", icon: ShieldCheck },
  ],
};

export interface SidebarFooterItem {
  title: string;
  icon: LucideIcon;
  href?: string;
  action?: "logout";
}

export const footerItemsByRole: Record<string, SidebarFooterItem[]> = {
  operator: [
    { title: "Profile", href: "/dashboard/profile", icon: User },
    { title: "Settings", href: "/dashboard/settings", icon: Settings },
    { title: "Log out", action: "logout", icon: LogOut },
  ],
  supervisor: [
    { title: "Profile", href: "/dashboard/profile", icon: User },
    { title: "Settings", href: "/dashboard/settings", icon: Settings },
    { title: "Log out", action: "logout", icon: LogOut },
  ],
  machine_incharge: [
    { title: "Profile", href: "/dashboard/profile", icon: User },
    { title: "Settings", href: "/dashboard/settings", icon: Settings },
    { title: "Log out", action: "logout", icon: LogOut },
  ],
  fleet_manager: [
    { title: "Profile", href: "/dashboard/profile", icon: User },
    { title: "Settings", href: "/dashboard/settings", icon: Settings },
    { title: "Log out", action: "logout", icon: LogOut },
  ],
  admin: [
    { title: "Profile", href: "/dashboard/profile", icon: User },
    { title: "System Settings", href: "/dashboard/settings", icon: Settings },
    { title: "Users", href: "/dashboard/users", icon: Users },
    { title: "Log out", action: "logout", icon: LogOut },
  ],
};
