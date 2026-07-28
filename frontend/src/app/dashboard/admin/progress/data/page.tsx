"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Mail,
  Send,
  ExternalLink,
} from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

// --- Data model ---

type CycleStageStatus = "done" | "pending";

interface CycleRecord {
  cycleNumber: number;
  preGrindStatus: CycleStageStatus;
  grindingDate: string | null;
  postGrindStatus: CycleStageStatus;
  remarks: string;
}

type TrackStatus = "up_to_date" | "due_soon" | "overdue" | "not_due";

interface AssignedPerson {
  id: string;
  name: string;
  email: string;
}

interface TestSiteRecord {
  id: string;
  testSiteNo: string;
  machineId: string;
  machineName: string;
  division: string;
  section: string;
  station: string;
  line: string;
  kmFrom: number;
  kmTo: number;
  establishedDate: string;
  gmtYear: number;
  cycles: CycleRecord[];
  grindingDueDate: string;
  repaintingDueDate: string;
  grindingReminderSent: boolean;
  repaintingReminderSent: boolean;
  assignedOperators: AssignedPerson[];
}

function daysUntil(dateStr: string) {
  const due = new Date(dateStr);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

function getStatus(
  dueDateStr: string,
  latestCycle: CycleRecord | undefined,
): TrackStatus {
  const complete =
    latestCycle?.preGrindStatus === "done" &&
    !!latestCycle?.grindingDate &&
    latestCycle?.postGrindStatus === "done";

  if (complete) return "up_to_date";

  const diff = daysUntil(dueDateStr);
  if (diff < 0) return "overdue";
  if (diff <= 7) return "due_soon";
  return "not_due";
}

const STATUS_CONFIG: Record<
  TrackStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    badgeClass: string;
    dotClass: string;
  }
> = {
  up_to_date: {
    label: "Up to date",
    icon: CheckCircle2,
    badgeClass: "border-green-500/50 text-green-600",
    dotClass: "bg-green-500",
  },
  due_soon: {
    label: "Due soon",
    icon: Clock,
    badgeClass: "border-amber-500/50 text-amber-600",
    dotClass: "bg-amber-500",
  },
  overdue: {
    label: "Overdue",
    icon: AlertTriangle,
    badgeClass: "border-destructive/50 text-destructive",
    dotClass: "bg-destructive",
  },
  not_due: {
    label: "Not due yet",
    icon: Clock,
    badgeClass: "border-border text-muted-foreground",
    dotClass: "bg-muted-foreground/40",
  },
};

function StatusBadge({ status }: { status: TrackStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`gap-1.5 ${cfg.badgeClass}`}>
      <Icon className="size-3.5" />
      {cfg.label}
    </Badge>
  );
}

// --- Dummy data — mirrors the columns in your reference spreadsheet ---

const OPERATORS: AssignedPerson[] = [
  { id: "1", name: "Ravi Kumar", email: "ravi.kumar@vandhana.com" },
  { id: "3", name: "Arjun Mehta", email: "arjun.mehta@vandhana.com" },
  { id: "6", name: "Anjali Desai", email: "anjali.desai@vandhana.com" },
  { id: "9", name: "Rohan Gupta", email: "rohan.gupta@vandhana.com" },
];

function makeCycles(count: number, allDone: boolean): CycleRecord[] {
  return Array.from({ length: count }, (_, i) => ({
    cycleNumber: i + 1,
    preGrindStatus: allDone || i < count - 1 ? "done" : "pending",
    grindingDate:
      allDone || i < count - 1 ? "2024-0" + ((i % 9) + 1) + "-15" : null,
    postGrindStatus: allDone || i < count - 1 ? "done" : "pending",
    remarks: i === count - 1 && !allDone ? "Awaiting operator upload" : "",
  }));
}

const DUMMY_TEST_SITES: TestSiteRecord[] = [
  {
    id: "1",
    testSiteNo: "T78",
    machineId: "1",
    machineName: "RGI96-1",
    division: "UMB/NR",
    section: "KKDE-UMB",
    station: "UMB",
    line: "UP",
    kmFrom: 191.507,
    kmTo: 191.827,
    establishedDate: "2023-04-05",
    gmtYear: 37.65,
    cycles: makeCycles(7, false),
    grindingDueDate: "2026-07-20",
    repaintingDueDate: "2026-10-04",
    grindingReminderSent: true,
    repaintingReminderSent: true,
    assignedOperators: [OPERATORS[0]],
  },
  {
    id: "2",
    testSiteNo: "T77",
    machineId: "1",
    machineName: "RGI96-1",
    division: "UMB/NR",
    section: "KKDE-UMB",
    station: "UMB",
    line: "DN",
    kmFrom: 191.598,
    kmTo: 191.868,
    establishedDate: "2023-04-05",
    gmtYear: 45.66,
    cycles: makeCycles(7, true),
    grindingDueDate: "2026-09-10",
    repaintingDueDate: "2026-10-04",
    grindingReminderSent: false,
    repaintingReminderSent: false,
    assignedOperators: [OPERATORS[0]],
  },
  {
    id: "3",
    testSiteNo: "T75",
    machineId: "2",
    machineName: "RGI96-2",
    division: "DLI/NR",
    section: "DLI-PNP",
    station: "SLKN",
    line: "UP",
    kmFrom: 49.5,
    kmTo: 50.5,
    establishedDate: "2023-04-03",
    gmtYear: 63.04,
    cycles: makeCycles(6, false),
    grindingDueDate: "2026-08-02",
    repaintingDueDate: "2026-08-02",
    grindingReminderSent: false,
    repaintingReminderSent: false,
    assignedOperators: [OPERATORS[1]],
  },
  {
    id: "4",
    testSiteNo: "T76",
    machineId: "2",
    machineName: "RGI96-2",
    division: "DLI/NR",
    section: "DLI-PNP",
    station: "SLKN",
    line: "DN",
    kmFrom: 49.5,
    kmTo: 50.5,
    establishedDate: "2023-04-03",
    gmtYear: 65.01,
    cycles: makeCycles(6, false),
    grindingDueDate: "2026-08-02",
    repaintingDueDate: "2026-08-02",
    grindingReminderSent: false,
    repaintingReminderSent: false,
    assignedOperators: [OPERATORS[1]],
  },
  {
    id: "5",
    testSiteNo: "T81",
    machineId: "2",
    machineName: "RGI96-2",
    division: "DLI/NR",
    section: "DLI-PNP",
    station: "SLKN",
    line: "UP",
    kmFrom: 52.0,
    kmTo: 53.0,
    establishedDate: "2023-04-03",
    gmtYear: 58.2,
    cycles: makeCycles(5, false),
    grindingDueDate: "2026-08-17",
    repaintingDueDate: "2026-08-17",
    grindingReminderSent: false,
    repaintingReminderSent: false,
    assignedOperators: [OPERATORS[1], OPERATORS[2]],
  },
  {
    id: "6",
    testSiteNo: "T50",
    machineId: "3",
    machineName: "SRGM-1",
    division: "HYB/SCR",
    section: "HYB-SC",
    station: "SC",
    line: "SL",
    kmFrom: 12.3,
    kmTo: 13.1,
    establishedDate: "2024-01-15",
    gmtYear: 22.4,
    cycles: makeCycles(3, true),
    grindingDueDate: "2026-12-01",
    repaintingDueDate: "2027-01-15",
    grindingReminderSent: false,
    repaintingReminderSent: false,
    assignedOperators: [OPERATORS[2]],
  },
  {
    id: "7",
    testSiteNo: "T20",
    machineId: "4",
    machineName: "LRG-1",
    division: "PUNE/CR",
    section: "PUNE-LNL",
    station: "LNL",
    line: "ML",
    kmFrom: 4.5,
    kmTo: 5.0,
    establishedDate: "2023-09-22",
    gmtYear: 30.1,
    cycles: makeCycles(4, false),
    grindingDueDate: "2026-07-25",
    repaintingDueDate: "2026-09-22",
    grindingReminderSent: false,
    repaintingReminderSent: false,
    assignedOperators: [OPERATORS[3]],
  },
  {
    id: "8",
    testSiteNo: "T10",
    machineId: "5",
    machineName: "FM-SWR",
    division: "CBE/SWR",
    section: "CBE-ED",
    station: "ED",
    line: "BL",
    kmFrom: 8.0,
    kmTo: 8.5,
    establishedDate: "2024-05-01",
    gmtYear: 15.6,
    cycles: makeCycles(2, true),
    grindingDueDate: "2027-05-01",
    repaintingDueDate: "2026-11-01",
    grindingReminderSent: false,
    repaintingReminderSent: false,
    assignedOperators: [OPERATORS[2]],
  },
];

const MACHINE_OPTIONS = Array.from(
  new Set(DUMMY_TEST_SITES.map((s) => s.machineName)),
);

export default function TestSiteTrackerPage() {
  const [testSites] = useState<TestSiteRecord[]>(DUMMY_TEST_SITES);
  const [machineFilter, setMachineFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailSite, setDetailSite] = useState<TestSiteRecord | null>(null);

  const enriched = useMemo(() => {
    return testSites.map((site) => {
      const latestCycle = site.cycles[site.cycles.length - 1];
      return {
        ...site,
        grindingStatus: getStatus(site.grindingDueDate, latestCycle),
        repaintingStatus: getStatus(site.repaintingDueDate, undefined), // repaint has no cycle-completeness signal here
        grindingDaysUntil: daysUntil(site.grindingDueDate),
      };
    });
  }, [testSites]);

  const filtered = useMemo(() => {
    return enriched.filter((site) => {
      if (machineFilter !== "all" && site.machineName !== machineFilter)
        return false;
      if (statusFilter !== "all" && site.grindingStatus !== statusFilter)
        return false;
      return true;
    });
  }, [enriched, machineFilter, statusFilter]);

  const summary = useMemo(() => {
    const overdue = enriched.filter(
      (s) => s.grindingStatus === "overdue",
    ).length;
    const dueSoon = enriched.filter(
      (s) => s.grindingStatus === "due_soon",
    ).length;
    const upToDate = enriched.filter(
      (s) => s.grindingStatus === "up_to_date",
    ).length;
    return { total: enriched.length, overdue, dueSoon, upToDate };
  }, [enriched]);

  function handleSendReminder(site: TestSiteRecord) {
    console.log("SEND REMINDER:", {
      testSiteId: site.id,
      testSiteNo: site.testSiteNo,
      recipients: site.assignedOperators.map((o) => o.email),
    });
  }

  const columns = useMemo<ColumnDef<(typeof enriched)[number]>[]>(
    () => [
      {
        accessorKey: "testSiteNo",
        header: "Test Site",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">
              {row.original.testSiteNo}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.line} line
            </p>
          </div>
        ),
      },
      {
        accessorKey: "machineName",
        header: "Machine",
        cell: ({ row }) => (
          <Link
            href={`/dashboard/admin/manage/machines/${row.original.machineId}`}
            className="text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {row.original.machineName}
          </Link>
        ),
      },
      {
        header: "Location",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground">
            <p>{row.original.section}</p>
            <p>
              {row.original.station} · {row.original.division}
            </p>
          </div>
        ),
      },
      {
        header: "Operator(s)",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1.5">
            {row.original.assignedOperators.map((op) => (
              <Link
                key={op.id}
                href={`/dashboard/admin/manage/users/${op.id}`}
                className="text-sm text-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                {op.name}
              </Link>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "grindingDaysUntil",
        header: "Grinding Due",
        cell: ({ row }) => (
          <div>
            <StatusBadge status={row.original.grindingStatus} />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {row.original.grindingDaysUntil < 0
                ? `${Math.abs(row.original.grindingDaysUntil)} days overdue`
                : `${row.original.grindingDaysUntil} days left`}{" "}
              · {row.original.grindingDueDate}
            </p>
          </div>
        ),
      },
      {
        header: "Repainting Due",
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            <StatusBadge status={row.original.repaintingStatus} />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {row.original.repaintingDueDate}
            </p>
          </div>
        ),
      },
      {
        header: "Reminder",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.grindingReminderSent ? (
            <Badge variant="secondary" className="gap-1.5">
              <Mail className="size-3.5" />
              Sent
            </Badge>
          ) : row.original.grindingStatus === "overdue" ||
            row.original.grindingStatus === "due_soon" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSendReminder(row.original)}
            >
              <Send className="mr-1.5 size-3.5" />
              Send
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDetailSite(row.original)}
          >
            <ExternalLink className="mr-1.5 size-3.5" />
            Details
          </Button>
        ),
      },
    ],
    [],
  );

  const hasActiveFilters = machineFilter !== "all" || statusFilter !== "all";

  return (
    <RequireRole roles={["admin"]}>
      <div className="mx-auto max-w-7xl min-w-0 px-6 py-10">
        <h1 className="text-xl font-semibold text-foreground">
          Test Site Tracker
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Grinding and repainting cycle status across every test site.
        </p>

        {/* Summary cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-border bg-card/40 p-5">
            <p className="text-xs text-muted-foreground">Total test sites</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {summary.total}
            </p>
          </Card>
          <Card className="border-destructive/30 bg-destructive/5 p-5">
            <p className="text-xs text-destructive">Overdue</p>
            <p className="mt-2 text-3xl font-semibold text-destructive">
              {summary.overdue}
            </p>
          </Card>
          <Card className="border-amber-500/30 bg-amber-500/5 p-5">
            <p className="text-xs text-amber-600">Due within 7 days</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">
              {summary.dueSoon}
            </p>
          </Card>
          <Card className="border-green-500/30 bg-green-500/5 p-5">
            <p className="text-xs text-green-600">Up to date</p>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              {summary.upToDate}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mt-8 border-border bg-card/40 p-5">
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Machine
              </label>
              <Select value={machineFilter} onValueChange={setMachineFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by machine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All machines</SelectItem>
                  {MACHINE_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Grinding Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="due_soon">Due soon</SelectItem>
                  <SelectItem value="up_to_date">Up to date</SelectItem>
                  <SelectItem value="not_due">Not due yet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  setMachineFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </Card>

        <div className="mt-8">
          <DataTable
            columns={columns}
            data={filtered}
            searchPlaceholder="Search test sites..."
            initialSorting={[{ id: "grindingDaysUntil", desc: false }]}
          />
        </div>
      </div>

      {detailSite && (
        <TestSiteDetailDialog
          site={detailSite}
          open={!!detailSite}
          onClose={() => setDetailSite(null)}
        />
      )}
    </RequireRole>
  );
}

function TestSiteDetailDialog({
  site,
  open,
  onClose,
}: {
  site: TestSiteRecord;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {site.testSiteNo} — {site.machineName}
          </DialogTitle>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Division / Railway</dt>
          <dd className="text-foreground">{site.division}</dd>
          <dt className="text-muted-foreground">Section</dt>
          <dd className="text-foreground">{site.section}</dd>
          <dt className="text-muted-foreground">Station</dt>
          <dd className="text-foreground">{site.station}</dd>
          <dt className="text-muted-foreground">Line</dt>
          <dd className="text-foreground">{site.line}</dd>
          <dt className="text-muted-foreground">KM Range</dt>
          <dd className="text-foreground">
            {site.kmFrom} – {site.kmTo}
          </dd>
          <dt className="text-muted-foreground">GMT / Year</dt>
          <dd className="text-foreground">{site.gmtYear}</dd>
          <dt className="text-muted-foreground">Established</dt>
          <dd className="text-foreground">{site.establishedDate}</dd>
        </dl>

        <Separator />

        <div>
          <p className="text-sm font-medium text-foreground">
            Assigned Operators
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {site.assignedOperators.map((op) => (
              <Button
                key={op.id}
                variant="outline"
                size="sm"
                render={
                  <Link href={`/dashboard/admin/manage/users/${op.id}`} />
                }
              >
                {op.name}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-sm font-medium text-foreground">Cycle History</p>
          <div className="mt-2 max-h-64 overflow-y-auto rounded-md border border-border">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-2">Cycle</th>
                  <th className="p-2">Pre-Grind</th>
                  <th className="p-2">Grinding Date</th>
                  <th className="p-2">Post-Grind</th>
                  <th className="p-2">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {site.cycles.map((cycle) => (
                  <tr
                    key={cycle.cycleNumber}
                    className="border-b border-border last:border-0"
                  >
                    <td className="p-2 font-medium text-foreground">
                      Cycle {cycle.cycleNumber}
                    </td>
                    <td className="p-2">
                      {cycle.preGrindStatus === "done" ? (
                        <Badge
                          variant="outline"
                          className="border-green-500/50 text-green-600"
                        >
                          Done
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-destructive/50 text-destructive"
                        >
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="p-2 text-muted-foreground">
                      {cycle.grindingDate ?? "—"}
                    </td>
                    <td className="p-2">
                      {cycle.postGrindStatus === "done" ? (
                        <Badge
                          variant="outline"
                          className="border-green-500/50 text-green-600"
                        >
                          Done
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-destructive/50 text-destructive"
                        >
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="p-2 text-muted-foreground">
                      {cycle.remarks || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
