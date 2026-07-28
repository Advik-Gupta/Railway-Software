"use client";

import Link from "next/link";
import {
  HardDrive,
  MapPin,
  Users,
  AlertTriangle,
  Clock,
  UserPlus,
  Wrench,
  ListChecks,
  Upload,
  CheckCircle2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// --- Dummy summary data — replace with real API data later ---

const SUMMARY_STATS = [
  {
    label: "Total Machines",
    value: 8,
    icon: HardDrive,
    accent: "text-blue-500 bg-blue-500/10",
  },
  {
    label: "Total Test Sites",
    value: 42,
    icon: MapPin,
    accent: "text-purple-500 bg-purple-500/10",
  },
  {
    label: "Active Users",
    value: 24,
    icon: Users,
    accent: "text-foreground bg-muted",
  },
  {
    label: "Overdue Grinding",
    value: 3,
    icon: AlertTriangle,
    accent: "text-destructive bg-destructive/10",
  },
  {
    label: "Due Within 7 Days",
    value: 5,
    icon: Clock,
    accent: "text-amber-500 bg-amber-500/10",
  },
  {
    label: "Pending Submissions",
    value: 6,
    icon: ListChecks,
    accent: "text-green-600 bg-green-500/10",
  },
];

interface ActivityItem {
  id: string;
  icon: LucideIcon;
  iconClass: string;
  title: string;
  description: string;
  time: string;
}

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    icon: Upload,
    iconClass: "text-blue-500 bg-blue-500/10",
    title: "Ravi Kumar",
    description: "Uploaded pre-grinding data for T73.1",
    time: "2 hours ago",
  },
  {
    id: "2",
    icon: HardDrive,
    iconClass: "text-purple-500 bg-purple-500/10",
    title: "Karan Malhotra",
    description: "Created machine RGI96-3 with 2 test sites",
    time: "3 hours ago",
  },
  {
    id: "3",
    icon: CheckCircle2,
    iconClass: "text-green-500 bg-green-500/10",
    title: "Priya Nair",
    description: "Approved submission for T73.1 pre-grinding",
    time: "5 hours ago",
  },
  {
    id: "4",
    icon: UserPlus,
    iconClass: "text-green-500 bg-green-500/10",
    title: "Karan Malhotra",
    description: "Created user Meera Pillai (Machine In-charge)",
    time: "1 day ago",
  },
  {
    id: "5",
    icon: AlertTriangle,
    iconClass: "text-destructive bg-destructive/10",
    title: "System",
    description: "T78 grinding cycle is now 8 days overdue",
    time: "1 day ago",
  },
];

interface AttentionItem {
  id: string;
  testSiteNo: string;
  machineName: string;
  daysOverdue: number;
  operator: string;
}

const NEEDS_ATTENTION: AttentionItem[] = [
  {
    id: "1",
    testSiteNo: "T78",
    machineName: "RGI96-1",
    daysOverdue: 8,
    operator: "Ravi Kumar",
  },
  {
    id: "2",
    testSiteNo: "T20",
    machineName: "LRG-1",
    daysOverdue: 3,
    operator: "Rohan Gupta",
  },
  {
    id: "3",
    testSiteNo: "T75",
    machineName: "RGI96-2",
    daysOverdue: -5,
    operator: "Arjun Mehta",
  },
];

const QUICK_ACTIONS = [
  {
    label: "Create Machine",
    href: "/dashboard/admin/manage/machines/create",
    icon: HardDrive,
  },
  {
    label: "Create User",
    href: "/dashboard/admin/manage/users/create",
    icon: UserPlus,
  },
  {
    label: "Test Site Tracker",
    href: "/dashboard/admin/progress/data",
    icon: MapPin,
  },
  {
    label: "Manage Machines",
    href: "/dashboard/admin/manage/machines",
    icon: Wrench,
  },
  { label: "Manage Users", href: "/dashboard/admin/manage/users", icon: Users },
  { label: "Activity Logs", href: "/dashboard/admin/logs", icon: ListChecks },
];

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl min-w-0 px-6 py-10">
      <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Overview of machines, test sites, and recent activity.
      </p>

      {/* Summary stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {SUMMARY_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border bg-card/40 p-5">
              <div
                className={`flex size-9 items-center justify-center rounded-lg ${stat.accent}`}
              >
                <Icon className="size-4" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {stat.label}
              </p>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Needs Attention */}
        <Card className="border-destructive/30 bg-destructive/5 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Needs Attention
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Test sites overdue or approaching their grinding deadline.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/dashboard/admin/progress/data" />}
            >
              View all
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {NEEDS_ATTENTION.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.testSiteNo}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {item.machineName}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Assigned to {item.operator}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    item.daysOverdue > 0
                      ? "border-destructive/50 text-destructive"
                      : "border-amber-500/50 text-amber-600"
                  }
                >
                  {item.daysOverdue > 0
                    ? `${item.daysOverdue} days overdue`
                    : `${Math.abs(item.daysOverdue)} days left`}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border bg-card/40 p-5">
          <p className="text-sm font-semibold text-foreground">Quick Actions</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-4 text-center text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-accent"
              >
                <action.icon className="size-4 text-muted-foreground" />
                {action.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6 border-border bg-card/40 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            Recent Activity
          </p>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/dashboard/admin/logs" />}
          >
            View all logs
            <ArrowRight className="ml-1.5 size-3.5" />
          </Button>
        </div>

        <div className="mt-4">
          {RECENT_ACTIVITY.map((item, i) => (
            <div key={item.id}>
              <div className="flex items-start gap-3 py-3">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${item.iconClass}`}
                >
                  <item.icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{item.title}</span>{" "}
                    <span className="text-muted-foreground">
                      {item.description}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.time}
                  </p>
                </div>
              </div>
              {i < RECENT_ACTIVITY.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
