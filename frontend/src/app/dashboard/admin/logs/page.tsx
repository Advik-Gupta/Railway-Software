"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Upload,
  UserPlus,
  UserCog,
  Trash2,
  HardDrive,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { DataTable } from "@/components/data-table/DataTable";
import { createActionsColumn } from "@/components/data-table/actions-column";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// --- Action type registry — one place defines label, icon, and color per event kind ---

type ActionTypeKey =
  | "upload_data"
  | "create_user"
  | "edit_user"
  | "delete_user"
  | "create_machine"
  | "edit_machine"
  | "delete_machine"
  | "approve_submission"
  | "reject_submission"
  | "login"
  | "logout"
  | "role_change";

interface ActionTypeDef {
  label: string;
  icon: LucideIcon;
  colorClass: string;
}

const ACTION_TYPES: Record<ActionTypeKey, ActionTypeDef> = {
  upload_data: {
    label: "Data Upload",
    icon: Upload,
    colorClass: "text-blue-500 bg-blue-500/10",
  },
  create_user: {
    label: "User Created",
    icon: UserPlus,
    colorClass: "text-green-500 bg-green-500/10",
  },
  edit_user: {
    label: "User Edited",
    icon: UserCog,
    colorClass: "text-amber-500 bg-amber-500/10",
  },
  delete_user: {
    label: "User Deleted",
    icon: Trash2,
    colorClass: "text-red-500 bg-red-500/10",
  },
  create_machine: {
    label: "Machine Created",
    icon: HardDrive,
    colorClass: "text-purple-500 bg-purple-500/10",
  },
  edit_machine: {
    label: "Machine Edited",
    icon: HardDrive,
    colorClass: "text-amber-500 bg-amber-500/10",
  },
  delete_machine: {
    label: "Machine Deleted",
    icon: Trash2,
    colorClass: "text-red-500 bg-red-500/10",
  },
  approve_submission: {
    label: "Submission Approved",
    icon: CheckCircle2,
    colorClass: "text-green-500 bg-green-500/10",
  },
  reject_submission: {
    label: "Submission Rejected",
    icon: XCircle,
    colorClass: "text-red-500 bg-red-500/10",
  },
  login: {
    label: "Login",
    icon: LogIn,
    colorClass: "text-muted-foreground bg-muted",
  },
  logout: {
    label: "Logout",
    icon: LogOut,
    colorClass: "text-muted-foreground bg-muted",
  },
  role_change: {
    label: "Role Changed",
    icon: ShieldAlert,
    colorClass: "text-amber-500 bg-amber-500/10",
  },
};

interface RelatedEntity {
  type: "user" | "machine";
  id: string;
  label: string;
}

interface LogEntry {
  id: string;
  timestamp: string; // ISO
  actorName: string;
  actorRole: string;
  actionType: ActionTypeKey;
  description: string;
  status: "success" | "failed";
  ipAddress: string;
  device: string;
  browser: string;
  location: string;
  relatedEntity?: RelatedEntity;
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const DUMMY_LOGS: LogEntry[] = [
  {
    id: "1",
    timestamp: "2026-07-25T09:12:00Z",
    actorName: "Ravi Kumar",
    actorRole: "Operator",
    actionType: "upload_data",
    description: "Uploaded pre-grinding data for T73.1",
    status: "success",
    ipAddress: "203.0.113.44",
    device: "iPhone 14",
    browser: "Safari 17",
    location: "Chennai, IN",
    relatedEntity: { type: "machine", id: "1", label: "RGI96-1" },
  },
  {
    id: "2",
    timestamp: "2026-07-25T08:47:00Z",
    actorName: "Karan Malhotra",
    actorRole: "Admin",
    actionType: "create_machine",
    description: "Created machine RGI96-3 with 2 test sites",
    status: "success",
    ipAddress: "198.51.100.12",
    device: "MacBook Air",
    browser: "Chrome 126",
    location: "Bengaluru, IN",
    relatedEntity: { type: "machine", id: "7", label: "RGI96-3" },
  },
  {
    id: "3",
    timestamp: "2026-07-25T08:30:00Z",
    actorName: "Priya Nair",
    actorRole: "Supervisor",
    actionType: "approve_submission",
    description: "Approved submission for T73.1 pre-grinding",
    status: "success",
    ipAddress: "203.0.113.19",
    device: "Windows PC",
    browser: "Edge 126",
    location: "Chennai, IN",
  },
  {
    id: "4",
    timestamp: "2026-07-24T18:05:00Z",
    actorName: "Karan Malhotra",
    actorRole: "Admin",
    actionType: "create_user",
    description: "Created user Meera Pillai (Machine In-charge)",
    status: "success",
    ipAddress: "198.51.100.12",
    device: "MacBook Air",
    browser: "Chrome 126",
    location: "Bengaluru, IN",
    relatedEntity: { type: "user", id: "10", label: "Meera Pillai" },
  },
  {
    id: "5",
    timestamp: "2026-07-24T17:40:00Z",
    actorName: "Arjun Mehta",
    actorRole: "Operator",
    actionType: "login",
    description: "Logged in",
    status: "success",
    ipAddress: "203.0.113.77",
    device: "Android Phone",
    browser: "Chrome Mobile 126",
    location: "Pune, IN",
  },
  {
    id: "6",
    timestamp: "2026-07-24T16:58:00Z",
    actorName: "Vikram Singh",
    actorRole: "Fleet Manager",
    actionType: "login",
    description: "Failed login attempt — incorrect password",
    status: "failed",
    ipAddress: "192.0.2.5",
    device: "Windows PC",
    browser: "Firefox 128",
    location: "Delhi, IN",
  },
  {
    id: "7",
    timestamp: "2026-07-24T15:22:00Z",
    actorName: "Sneha Rao",
    actorRole: "Machine In-charge",
    actionType: "reject_submission",
    description: "Rejected submission for T50 — missing MiniProf file",
    status: "success",
    ipAddress: "203.0.113.61",
    device: "iPad",
    browser: "Safari 17",
    location: "Hyderabad, IN",
  },
  {
    id: "8",
    timestamp: "2026-07-24T14:10:00Z",
    actorName: "Karan Malhotra",
    actorRole: "Admin",
    actionType: "role_change",
    description: "Changed Rohan Gupta's role from Operator to Supervisor",
    status: "success",
    ipAddress: "198.51.100.12",
    device: "MacBook Air",
    browser: "Chrome 126",
    location: "Bengaluru, IN",
    relatedEntity: { type: "user", id: "9", label: "Rohan Gupta" },
  },
  {
    id: "9",
    timestamp: "2026-07-24T11:03:00Z",
    actorName: "Karan Malhotra",
    actorRole: "Admin",
    actionType: "delete_machine",
    description: "Deleted machine FM-SWR-2 (decommissioned)",
    status: "success",
    ipAddress: "198.51.100.12",
    device: "MacBook Air",
    browser: "Chrome 126",
    location: "Bengaluru, IN",
  },
  {
    id: "10",
    timestamp: "2026-07-23T19:47:00Z",
    actorName: "Anjali Desai",
    actorRole: "Operator",
    actionType: "upload_data",
    description: "Uploaded post-grinding data for T76.4",
    status: "success",
    ipAddress: "203.0.113.90",
    device: "iPhone 13",
    browser: "Safari 17",
    location: "Chennai, IN",
    relatedEntity: { type: "machine", id: "1", label: "RGI96-1" },
  },
  {
    id: "11",
    timestamp: "2026-07-23T18:12:00Z",
    actorName: "Divya Iyer",
    actorRole: "Supervisor",
    actionType: "logout",
    description: "Logged out",
    status: "success",
    ipAddress: "203.0.113.19",
    device: "Windows PC",
    browser: "Edge 126",
    location: "Chennai, IN",
  },
  {
    id: "12",
    timestamp: "2026-07-23T14:55:00Z",
    actorName: "Karan Malhotra",
    actorRole: "Admin",
    actionType: "edit_user",
    description: "Updated employee ID for Ravi Kumar",
    status: "success",
    ipAddress: "198.51.100.12",
    device: "MacBook Air",
    browser: "Chrome 126",
    location: "Bengaluru, IN",
    relatedEntity: { type: "user", id: "1", label: "Ravi Kumar" },
  },
];

export default function LogsPage() {
  const [logs] = useState<LogEntry[]>(DUMMY_LOGS);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredLogs = useMemo(() => {
    if (typeFilter === "all") return logs;
    return logs.filter((l) => l.actionType === typeFilter);
  }, [logs, typeFilter]);

  const columns = useMemo<ColumnDef<LogEntry>[]>(
    () => [
      {
        accessorKey: "actionType",
        header: "Type",
        cell: ({ getValue }) => {
          const def = ACTION_TYPES[getValue<ActionTypeKey>()];
          const Icon = def.icon;
          return (
            <Badge variant="secondary" className={`gap-1.5 ${def.colorClass}`}>
              <Icon className="size-3.5" />
              {def.label}
            </Badge>
          );
        },
      },
      {
        header: "User",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">
              {row.original.actorName}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.actorRole}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "timestamp",
        header: "Time",
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatTimestamp(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue<"success" | "failed">();
          return (
            <Badge
              variant="outline"
              className={
                status === "success"
                  ? "border-green-500/50 text-green-600"
                  : "border-destructive/50 text-destructive"
              }
            >
              {status === "success" ? "Success" : "Failed"}
            </Badge>
          );
        },
      },
      createActionsColumn<LogEntry>({
        onView: (log) => setSelectedLog(log),
      }),
    ],
    [],
  );

  return (
    <RequireRole roles={["admin"]}>
      <div className="mx-auto max-w-5xl min-w-0 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Activity Logs
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredLogs.length} event{filteredLogs.length !== 1 ? "s" : ""}
            </p>
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(ACTION_TYPES).map(([key, def]) => (
                <SelectItem key={key} value={key}>
                  {def.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6">
          <DataTable
            columns={columns}
            data={filteredLogs}
            searchPlaceholder="Search logs..."
          />
        </div>
      </div>

      {selectedLog && (
        <LogDetailsDialog
          log={selectedLog}
          open={!!selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </RequireRole>
  );
}

function LogDetailsDialog({
  log,
  open,
  onClose,
}: {
  log: LogEntry;
  open: boolean;
  onClose: () => void;
}) {
  const def = ACTION_TYPES[log.actionType];
  const Icon = def.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Details</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <div
            className={`flex size-9 items-center justify-center rounded-full ${def.colorClass}`}
          >
            <Icon className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{def.label}</p>
            <p className="text-xs text-muted-foreground">
              {formatTimestamp(log.timestamp)}
            </p>
          </div>
        </div>

        <Separator />

        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-muted-foreground">Actor</dt>
          <dd className="text-foreground">
            {log.actorName}{" "}
            <span className="text-muted-foreground">({log.actorRole})</span>
          </dd>

          <dt className="text-muted-foreground">Description</dt>
          <dd className="text-foreground">{log.description}</dd>

          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <Badge
              variant="outline"
              className={
                log.status === "success"
                  ? "border-green-500/50 text-green-600"
                  : "border-destructive/50 text-destructive"
              }
            >
              {log.status === "success" ? "Success" : "Failed"}
            </Badge>
          </dd>

          <dt className="text-muted-foreground">IP Address</dt>
          <dd className="text-foreground">{log.ipAddress}</dd>

          <dt className="text-muted-foreground">Location</dt>
          <dd className="text-foreground">{log.location}</dd>

          <dt className="text-muted-foreground">Device</dt>
          <dd className="text-foreground">{log.device}</dd>

          <dt className="text-muted-foreground">Browser</dt>
          <dd className="text-foreground">{log.browser}</dd>
        </dl>

        {log.relatedEntity && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground">Related to</p>
              <Button
                variant="outline"
                className="mt-2 w-full"
                render={
                  <Link
                    href={
                      log.relatedEntity.type === "user"
                        ? `/dashboard/admin/manage/users/${log.relatedEntity.id}`
                        : `/dashboard/admin/manage/machines/${log.relatedEntity.id}`
                    }
                  />
                }
              >
                View{" "}
                {log.relatedEntity.type === "user" ? "Employee" : "Machine"}{" "}
                Profile — {log.relatedEntity.label}
              </Button>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
