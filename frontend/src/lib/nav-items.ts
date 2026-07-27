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
  ChartPie,
  Logs,
  SquareChartGantt,
  TramFront,
  TrendingUp,
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
      title: "Upload Data",
      href: "/dashboard/upload",
      icon: Upload,
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
  admin: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      title: "Progress",
      href: "/dashboard/reports",
      icon: TrendingUp,
      items: [
        { title: "Data Uploads", href: "/dashboard/admin/progress" },
        { title: "Due", href: "/dashboard/admin/progress/due" },
      ],
    },
    {
      title: "Create",
      href: "/dashboard/reports",
      icon: TramFront,
      items: [
        { title: "Machines", href: "/dashboard/admin/create/machines" },
        { title: "Users", href: "/dashboard/admin/create/users" },
      ],
    },
    {
      title: "Manage",
      href: "/dashboard/reports",
      icon: SquareChartGantt,
      items: [
        { title: "Machines", href: "/dashboard/admin/manage/machines" },
        { title: "Users", href: "/dashboard/admin/manage/users" },
      ],
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: FileBarChart,
      items: [
        { title: "Generate Report", href: "/dashboard/reports/generate" },
        { title: "Report History", href: "/dashboard/reports/history" },
      ],
    },
    { title: "Logs", href: "/dashboard/admin/logs", icon: Logs },
    { title: "Analytics", href: "/dashboard/admin/analytics", icon: ChartPie },
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
  admin: [
    { title: "Profile", href: "/dashboard/profile", icon: User },
    { title: "Settings", href: "/dashboard/settings", icon: Settings },
    { title: "Log out", action: "logout", icon: LogOut },
  ],
};
