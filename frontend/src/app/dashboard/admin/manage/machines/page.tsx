"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { RequireRole } from "@/components/RequireRole";
import { DataTable } from "@/components/data-table/DataTable";
import { createActionsColumn } from "@/components/data-table/actions-column";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableSkeleton } from "@/components/skeletons/DataTableSkeleton";
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
import { type Machine } from "@/lib/api-clients/machines-api";
import { useMachines, useDeleteMachine } from "@/hooks/use-machines";

const MACHINE_TYPE_LABELS: Record<string, string> = {
  RGI96: "RGI96",
  SRGM: "SRGM",
  LRG: "LRG",
  FM: "FM",
  CMRL_VRA: "CMRL (VRA)",
};

export default function ManageMachinesPage() {
  const { data: machines = [], isLoading, isError } = useMachines();
  const deleteMachine = useDeleteMachine();
  const [deletingMachine, setDeletingMachine] = useState<Machine | null>(null);

  async function handleDeleteConfirm() {
    if (!deletingMachine) return;
    deleteMachine.mutate(deletingMachine.id);
    setDeletingMachine(null);
  }

  const columns = useMemo<ColumnDef<Machine>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Machine Name",
        cell: ({ getValue }) => (
          <span className="font-medium text-foreground">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "machine_type",
        header: "Type",
        cell: ({ getValue }) => (
          <Badge variant="secondary">
            {MACHINE_TYPE_LABELS[getValue<string>()] ?? getValue<string>()}
          </Badge>
        ),
      },
      {
        header: "Test Sites",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.test_site_count ?? 0} site
            {(row.original.test_site_count ?? 0) !== 1 ? "s" : ""}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created Date",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {new Date(getValue<string>()).toLocaleDateString()}
          </span>
        ),
      },
      createActionsColumn<Machine>({
        onDelete: (machine) => setDeletingMachine(machine),
        viewHref: (machine) => `/dashboard/admin/manage/machines/${machine.id}`,
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

        {isError && (
          <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {isError}
          </p>
        )}

        <div className="mt-6">
          {isLoading ? (
            <DataTableSkeleton columnCount={5} />
          ) : (
            <DataTable
              columns={columns}
              data={machines}
              searchPlaceholder="Search machines..."
            />
          )}
        </div>
      </div>

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
                {deletingMachine?.name}
              </span>
              ? This also deletes all its test sites and points. This cannot be
              undone.
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
