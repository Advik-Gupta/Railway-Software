"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { RequireRole } from "@/components/RequireRole";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableSkeleton } from "@/components/skeletons/DataTableSkeleton";
import { createActionsColumn } from "@/components/data-table/actions-column";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useUsersList, useDeleteUser } from "@/hooks/use-users";
import { avatarFor, type UserSummary } from "@/lib/api-clients/users-api";

const ROLE_LABELS: Record<string, string> = {
  operator: "Operator",
  supervisor: "Supervisor",
  machine_incharge: "Machine In-charge",
  fleet_manager: "Fleet Manager",
  admin: "Admin",
};

export default function ManageUsersPage() {
  const { data: users = [], isLoading, isError } = useUsersList();
  const deleteUser = useDeleteUser();
  const [deletingUser, setDeletingUser] = useState<UserSummary | null>(null);

  function handleDeleteConfirm() {
    if (!deletingUser) return;
    deleteUser.mutate(deletingUser.id);
    setDeletingUser(null);
  }

  const columns = useMemo<ColumnDef<UserSummary>[]>(
    () => [
      {
        header: "User",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage
                src={avatarFor(row.original.full_name)}
                alt={row.original.full_name}
              />
              <AvatarFallback>
                {row.original.full_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground">
              {row.original.full_name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ getValue }) => (
          <Badge variant="secondary">
            {ROLE_LABELS[getValue<string>()] ?? getValue<string>()}
          </Badge>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Joined",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {new Date(getValue<string>()).toLocaleDateString()}
          </span>
        ),
      },
      createActionsColumn<UserSummary>({
        onDelete: (user) => setDeletingUser(user),
        viewHref: (user) => `/dashboard/admin/manage/users/${user.id}`,
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
              Manage Users
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {users.length} user{users.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button render={<Link href="/dashboard/admin/create/users" />}>
            Create User
          </Button>
        </div>

        {isError && (
          <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Could not load users. Is the server running?
          </p>
        )}

        <div className="mt-6">
          {isLoading ? (
            <DataTableSkeleton columnCount={5} />
          ) : (
            <DataTable
              columns={columns}
              data={users}
              searchPlaceholder="Search users..."
            />
          )}
        </div>
      </div>

      <AlertDialog
        open={!!deletingUser}
        onOpenChange={(o) => !o && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deletingUser?.full_name}
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
