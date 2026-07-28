"use client";

import Link from "next/link";
import {
  Upload,
  AlertTriangle,
  Clock,
  FileWarning,
  CheckCircle2,
  ClipboardList,
  ArrowRight,
  MapPin,
  User,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// --- Dummy data — scoped to "this operator" for now, replace with real API data later ---

type TaskStatus = "overdue" | "due_soon" | "partial" | "not_due";

interface TaskItem {
  id: string;
  testSiteNo: string;
  machineName: string;
  dataStage: string; // e.g. "Pre-grinding", "Post-grinding"
  status: TaskStatus;
  daysInfo: string; // e.g. "3 days overdue", "2 days left"
  fieldsFilled?: number;
  fieldsTotal?: number;
}

const MY_TASKS: TaskItem[] = [
  {
    id: "1",
    testSiteNo: "T78",
    machineName: "RGI96-1",
    dataStage: "Post-grinding",
    status: "overdue",
    daysInfo: "8 days overdue",
  },
  {
    id: "2",
    testSiteNo: "T73.2",
    machineName: "RGI96-1",
    dataStage: "Pre-grinding",
    status: "partial",
    daysInfo: "6 of 10 fields uploaded",
    fieldsFilled: 6,
    fieldsTotal: 10,
  },
  {
    id: "3",
    testSiteNo: "T77",
    machineName: "RGI96-1",
    dataStage: "Grinding",
    status: "due_soon",
    daysInfo: "2 days left",
  },
  {
    id: "4",
    testSiteNo: "T74",
    machineName: "RGI96-1",
    dataStage: "Pre-grinding",
    status: "not_due",
    daysInfo: "18 days left",
  },
];

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; icon: LucideIcon; badgeClass: string; cardClass: string }
> = {
  overdue: {
    label: "Overdue",
    icon: AlertTriangle,
    badgeClass: "border-destructive/50 text-destructive",
    cardClass: "border-destructive/30 bg-destructive/5",
  },
  due_soon: {
    label: "Due soon",
    icon: Clock,
    badgeClass: "border-amber-500/50 text-amber-600",
    cardClass: "border-amber-500/30 bg-amber-500/5",
  },
  partial: {
    label: "Partially uploaded",
    icon: FileWarning,
    badgeClass: "border-blue-500/50 text-blue-600",
    cardClass: "border-blue-500/30 bg-blue-500/5",
  },
  not_due: {
    label: "Not due yet",
    icon: Clock,
    badgeClass: "border-border text-muted-foreground",
    cardClass: "border-border bg-card/40",
  },
};

const SUMMARY_STATS = [
  {
    label: "Assigned Test Sites",
    value: 12,
    icon: MapPin,
    accent: "text-foreground bg-muted",
  },
  {
    label: "Overdue",
    value: 1,
    icon: AlertTriangle,
    accent: "text-destructive bg-destructive/10",
  },
  {
    label: "Due Within 7 Days",
    value: 1,
    icon: Clock,
    accent: "text-amber-500 bg-amber-500/10",
  },
  {
    label: "Partially Uploaded",
    value: 1,
    icon: FileWarning,
    accent: "text-blue-500 bg-blue-500/10",
  },
  {
    label: "Completed This Month",
    value: 9,
    icon: CheckCircle2,
    accent: "text-green-600 bg-green-500/10",
  },
];

interface ActivityItem {
  id: string;
  icon: LucideIcon;
  iconClass: string;
  description: string;
  time: string;
}

const MY_RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    icon: Upload,
    iconClass: "text-blue-500 bg-blue-500/10",
    description: "Uploaded pre-grinding data for T73.1",
    time: "2 hours ago",
  },
  {
    id: "2",
    icon: CheckCircle2,
    iconClass: "text-green-500 bg-green-500/10",
    description: "Submission for T72 approved by supervisor",
    time: "1 day ago",
  },
  {
    id: "3",
    icon: FileWarning,
    iconClass: "text-blue-500 bg-blue-500/10",
    description: "Started upload for T73.2 pre-grinding (6/10 fields)",
    time: "1 day ago",
  },
  {
    id: "4",
    icon: Upload,
    iconClass: "text-blue-500 bg-blue-500/10",
    description: "Uploaded post-grinding data for T71",
    time: "3 days ago",
  },
];

const QUICK_ACTIONS = [
  { label: "Start Upload", href: "/dashboard/uploads", icon: Upload },
  {
    label: "My Submissions",
    href: "/dashboard/submissions",
    icon: ClipboardList,
  },
  { label: "My Profile", href: "/dashboard/profile", icon: User },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function OperatorDashboard() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  const urgentTasks = MY_TASKS.filter(
    (t) =>
      t.status === "overdue" ||
      t.status === "due_soon" ||
      t.status === "partial",
  );

  return (
    <div className="mx-auto max-w-5xl min-w-0 px-6 py-10">
      <h1 className="text-xl font-semibold text-foreground">
        {greeting()}, {firstName}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Here's what needs your attention today.
      </p>

      {/* Summary stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
        {/* Needs Your Attention */}
        <Card className="border-border bg-card/40 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Needs Your Attention
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Uploads that are overdue, due soon, or left partially complete.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/dashboard/submissions" />}
            >
              View all
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {urgentTasks.length === 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-3 text-sm text-green-600">
                <CheckCircle2 className="size-4" />
                You're all caught up. Nothing needs attention right now.
              </div>
            )}

            {urgentTasks.map((task) => {
              const cfg = STATUS_CONFIG[task.status];
              const Icon = cfg.icon;
              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 ${cfg.cardClass}`}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {task.testSiteNo}{" "}
                      <span className="font-normal text-muted-foreground">
                        · {task.machineName} · {task.dataStage}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {task.daysInfo}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`gap-1.5 ${cfg.badgeClass}`}
                    >
                      <Icon className="size-3.5" />
                      {cfg.label}
                    </Badge>
                    <Button
                      size="sm"
                      render={<Link href="/dashboard/uploads" />}
                    >
                      {task.status === "partial" ? "Continue" : "Upload"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border bg-card/40 p-5">
          <p className="text-sm font-semibold text-foreground">Quick Actions</p>
          <div className="mt-4 flex flex-col gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-accent"
              >
                <action.icon className="size-4 text-muted-foreground" />
                {action.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* My Recent Activity */}
      <Card className="mt-6 border-border bg-card/40 p-5">
        <p className="text-sm font-semibold text-foreground">
          My Recent Activity
        </p>
        <div className="mt-4">
          {MY_RECENT_ACTIVITY.map((item, i) => (
            <div key={item.id}>
              <div className="flex items-start gap-3 py-3">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${item.iconClass}`}
                >
                  <item.icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{item.description}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.time}
                  </p>
                </div>
              </div>
              {i < MY_RECENT_ACTIVITY.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
