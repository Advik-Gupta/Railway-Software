"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { RequireRole } from "@/components/RequireRole";
import { DataTable } from "@/components/data-table/DataTable";
import { createActionsColumn } from "@/components/data-table/actions-column";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface MachineTypeDef {
  value: string;
  label: string;
  points: number;
}

const MACHINE_TYPES: MachineTypeDef[] = [
  { value: "RGI96", label: "RGI96", points: 6 },
  { value: "SRGM", label: "SRGM", points: 8 },
  { value: "LRG", label: "LRG", points: 2 },
  { value: "FM", label: "FM", points: 2 },
  { value: "CMRL_VRA", label: "CMRL (VRA)", points: 6 },
];

const MACHINE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  MACHINE_TYPES.map((t) => [t.value, t.label]),
);

interface Machine {
  id: string;
  machineType: string;
  machineName: string;
  pointsPerTestSite: number;
  testSites: string[];
  createdDate: string;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

const DUMMY_MACHINES: Machine[] = [
  {
    id: "1",
    machineType: "RGI96",
    machineName: "RGI96-1",
    pointsPerTestSite: 6,
    testSites: ["T73", "T74", "T75", "T76"],
    createdDate: "2024-01-10",
  },
  {
    id: "2",
    machineType: "RGI96",
    machineName: "RGI96-2",
    pointsPerTestSite: 6,
    testSites: ["T77", "T78", "T79", "T80", "T81", "T82"],
    createdDate: "2024-02-14",
  },
  {
    id: "3",
    machineType: "SRGM",
    machineName: "SRGM-1",
    pointsPerTestSite: 8,
    testSites: ["T50", "T51"],
    createdDate: "2023-11-05",
  },
  {
    id: "4",
    machineType: "LRG",
    machineName: "LRG-1",
    pointsPerTestSite: 2,
    testSites: ["T20", "T21", "T22"],
    createdDate: "2023-09-22",
  },
  {
    id: "5",
    machineType: "FM",
    machineName: "FM-SWR",
    pointsPerTestSite: 2,
    testSites: ["T10"],
    createdDate: "2024-05-01",
  },
  {
    id: "6",
    machineType: "CMRL_VRA",
    machineName: "CMRL-VRA-1",
    pointsPerTestSite: 6,
    testSites: ["T90", "T91", "T92"],
    createdDate: "2024-03-18",
  },
  {
    id: "7",
    machineType: "RGI96",
    machineName: "RGI96-3",
    pointsPerTestSite: 6,
    testSites: ["T83", "T84"],
    createdDate: "2024-06-30",
  },
  {
    id: "8",
    machineType: "SRGM",
    machineName: "SRGM-2",
    pointsPerTestSite: 8,
    testSites: ["T52", "T53", "T54"],
    createdDate: "2024-04-11",
  },
];

export default function ManageMachinesPage() {
  const [machines, setMachines] = useState<Machine[]>(DUMMY_MACHINES);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [deletingMachine, setDeletingMachine] = useState<Machine | null>(null);

  function handleDeleteConfirm() {
    if (!deletingMachine) return;
    console.log("DELETE MACHINE:", deletingMachine.id);
    setMachines((prev) => prev.filter((m) => m.id !== deletingMachine.id));
    setDeletingMachine(null);
  }

  function handleEditSave(updated: Machine) {
    console.log("UPDATE MACHINE:", updated);
    setMachines((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setEditingMachine(null);
  }

  const columns = useMemo<ColumnDef<Machine>[]>(
    () => [
      {
        accessorKey: "machineName",
        header: "Machine Name",
        cell: ({ getValue }) => (
          <span className="font-medium text-foreground">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "machineType",
        header: "Type",
        cell: ({ getValue }) => (
          <Badge variant="secondary">
            {MACHINE_TYPE_LABELS[getValue<string>()] ?? getValue<string>()}
          </Badge>
        ),
      },
      {
        accessorKey: "pointsPerTestSite",
        header: "Points / Site",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<number>()}</span>
        ),
      },
      {
        header: "Test Sites",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.testSites.length} site
            {row.original.testSites.length !== 1 ? "s" : ""}
          </span>
        ),
      },
      {
        accessorKey: "createdDate",
        header: "Created Date",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<string>()}</span>
        ),
      },
      createActionsColumn<Machine>({
        onEdit: (machine) => setEditingMachine(machine),
        onDelete: (machine) => setDeletingMachine(machine),
        viewHref: (machine) => `/dashboard/admin/manage/machines/${machine.id}`,
      }),
    ],
    [],
  );

  return (
    <RequireRole roles={["admin"]}>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Manage Machines
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {machines.length} machine{machines.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button render={<Link href="/dashboard/admin/create/machines" />}>
            Create Machine
          </Button>
        </div>

        <div className="mt-6">
          <DataTable
            columns={columns}
            data={machines}
            searchPlaceholder="Search machines..."
          />
        </div>
      </div>

      {editingMachine && (
        <EditMachineDialog
          machine={editingMachine}
          open={!!editingMachine}
          onClose={() => setEditingMachine(null)}
          onSave={handleEditSave}
        />
      )}

      <AlertDialog
        open={!!deletingMachine}
        onOpenChange={(o) => !o && setDeletingMachine(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete machine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deletingMachine?.machineName}
              </span>
              ? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RequireRole>
  );
}

function EditMachineDialog({
  machine,
  open,
  onClose,
  onSave,
}: {
  machine: Machine;
  open: boolean;
  onClose: () => void;
  onSave: (machine: Machine) => void;
}) {
  const [machineType, setMachineType] = useState(machine.machineType);
  const [machineName, setMachineName] = useState(machine.machineName);
  const [testSiteCount, setTestSiteCount] = useState(machine.testSites.length);
  const [startingNumber, setStartingNumber] = useState(() => {
    const firstNum = parseInt(
      machine.testSites[0]?.replace("T", "") ?? "0",
      10,
    );
    return isNaN(firstNum) ? 1 : firstNum;
  });

  const selectedTypeDef = MACHINE_TYPES.find((t) => t.value === machineType);

  const regeneratedTestSites = useMemo(() => {
    return Array.from(
      { length: testSiteCount },
      (_, i) => `T${startingNumber + i}`,
    );
  }, [testSiteCount, startingNumber]);

  const previewTestSite = regeneratedTestSites[0] ?? "T—";
  const previewPoints = useMemo(() => {
    if (!selectedTypeDef) return [];
    return Array.from(
      { length: selectedTypeDef.points },
      (_, i) => `${previewTestSite}.${i + 1}`,
    );
  }, [selectedTypeDef, previewTestSite]);

  function handleSave() {
    onSave({
      ...machine,
      machineType,
      machineName,
      pointsPerTestSite: selectedTypeDef?.points ?? machine.pointsPerTestSite,
      testSites: regeneratedTestSites,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Machine</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label className="text-xs">Machine Type</Label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {MACHINE_TYPES.map((type) => (
                <Card
                  key={type.value}
                  onClick={() => setMachineType(type.value)}
                  className={`flex h-14 cursor-pointer flex-col items-center justify-center gap-0.5 border-border text-center text-xs transition-colors ${
                    machineType === type.value
                      ? "border-primary bg-primary/10"
                      : "bg-card/40 hover:border-primary/50"
                  }`}
                >
                  <span className="font-medium text-foreground">
                    {type.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {type.points} pts
                  </span>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Machine Name</Label>
            <Input
              className="mt-1.5"
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
            />
          </div>

          <div className="rounded-lg border border-border bg-card/40 p-4">
            <p className="text-sm font-medium text-foreground">Test Sites</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Changing these regenerates the test site list below.
            </p>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Number of test sites</span>
                <span>{testSiteCount}</span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                step={1}
                value={testSiteCount}
                onChange={(e) => setTestSiteCount(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="mt-4 w-40">
              <Label className="text-xs">Starting Number</Label>
              <Input
                type="number"
                className="mt-1.5"
                value={startingNumber}
                onChange={(e) => setStartingNumber(Number(e.target.value) || 0)}
              />
            </div>

            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Test sites</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {regeneratedTestSites.map((site, i) => (
                  <Card
                    key={site}
                    className={`flex h-10 items-center justify-center border-border text-xs font-medium ${
                      i === 0
                        ? "border-primary bg-primary/10 text-foreground"
                        : "bg-card/40 text-muted-foreground"
                    }`}
                  >
                    {site}
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {selectedTypeDef && (
            <div className="rounded-lg border border-border bg-card/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Point Layout Preview
                </p>
                <Badge variant="secondary">
                  {selectedTypeDef.points} points
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {previewPoints.map((point) => (
                  <Card
                    key={point}
                    className="flex h-10 items-center justify-center border-border bg-background/40 text-xs font-medium text-foreground"
                  >
                    {point}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
