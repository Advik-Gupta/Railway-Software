"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { RequireRole } from "@/components/RequireRole";
import { DataTable } from "@/components/data-table/DataTable";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const ROLES = [
  { value: "operator", label: "Operator" },
  { value: "supervisor", label: "Supervisor" },
  { value: "machine_incharge", label: "Machine In-charge" },
  { value: "fleet_manager", label: "Fleet Manager" },
  { value: "admin", label: "Admin" },
];

const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  ROLES.map((r) => [r.value, r.label]),
);

const MACHINES = ["RGI96-01", "RGI96-02", "SRGM-01", "LRG-01", "FM-SWR"];

interface User {
  id: string;
  name: string;
  photoUrl: string;
  employeeId: string;
  role: string;
  dob: string;
  joiningDate: string;
  machineAccess: string[];
}

function avatarFor(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
}

function calculateAge(dob: string): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  )
    age--;
  return age;
}

const DUMMY_USERS: User[] = [
  {
    id: "1",
    name: "Ravi Kumar",
    photoUrl: avatarFor("Ravi Kumar"),
    employeeId: "VIPL-1042",
    role: "operator",
    dob: "1994-03-12",
    joiningDate: "2023-06-01",
    machineAccess: ["RGI96-01"],
  },
  {
    id: "2",
    name: "Priya Nair",
    photoUrl: avatarFor("Priya Nair"),
    employeeId: "VIPL-1043",
    role: "supervisor",
    dob: "1988-11-02",
    joiningDate: "2021-01-15",
    machineAccess: [],
  },
  {
    id: "3",
    name: "Arjun Mehta",
    photoUrl: avatarFor("Arjun Mehta"),
    employeeId: "VIPL-1044",
    role: "operator",
    dob: "1996-07-19",
    joiningDate: "2024-02-20",
    machineAccess: ["SRGM-01", "LRG-01"],
  },
  {
    id: "4",
    name: "Sneha Rao",
    photoUrl: avatarFor("Sneha Rao"),
    employeeId: "VIPL-1045",
    role: "machine_incharge",
    dob: "1990-01-25",
    joiningDate: "2020-09-10",
    machineAccess: [],
  },
  {
    id: "5",
    name: "Vikram Singh",
    photoUrl: avatarFor("Vikram Singh"),
    employeeId: "VIPL-1046",
    role: "fleet_manager",
    dob: "1985-05-30",
    joiningDate: "2019-04-05",
    machineAccess: [],
  },
  {
    id: "6",
    name: "Anjali Desai",
    photoUrl: avatarFor("Anjali Desai"),
    employeeId: "VIPL-1047",
    role: "operator",
    dob: "1998-09-14",
    joiningDate: "2024-08-12",
    machineAccess: ["FM-SWR"],
  },
  {
    id: "7",
    name: "Karan Malhotra",
    photoUrl: avatarFor("Karan Malhotra"),
    employeeId: "VIPL-1048",
    role: "admin",
    dob: "1987-12-03",
    joiningDate: "2018-03-01",
    machineAccess: [],
  },
  {
    id: "8",
    name: "Divya Iyer",
    photoUrl: avatarFor("Divya Iyer"),
    employeeId: "VIPL-1049",
    role: "supervisor",
    dob: "1992-04-22",
    joiningDate: "2022-07-18",
    machineAccess: [],
  },
  {
    id: "9",
    name: "Rohan Gupta",
    photoUrl: avatarFor("Rohan Gupta"),
    employeeId: "VIPL-1050",
    role: "operator",
    dob: "1995-02-08",
    joiningDate: "2023-11-30",
    machineAccess: ["RGI96-02"],
  },
  {
    id: "10",
    name: "Meera Pillai",
    photoUrl: avatarFor("Meera Pillai"),
    employeeId: "VIPL-1051",
    role: "machine_incharge",
    dob: "1991-08-17",
    joiningDate: "2021-05-22",
    machineAccess: [],
  },
];

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  function handleDeleteConfirm() {
    if (!deletingUser) return;
    console.log("DELETE USER:", deletingUser.id);
    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    setDeletingUser(null);
  }

  function handleEditSave(updated: User) {
    console.log("UPDATE USER:", updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setEditingUser(null);
  }

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: "User",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage
                src={row.original.photoUrl}
                alt={row.original.name}
              />
              <AvatarFallback>
                {row.original.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground">
              {row.original.name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "employeeId",
        header: "Employee ID",
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
        header: "Age",
        cell: ({ row }) => {
          const age = calculateAge(row.original.dob);
          return <span className="text-muted-foreground">{age ?? "—"}</span>;
        },
      },
      {
        accessorKey: "joiningDate",
        header: "Joining Date",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<string>()}</span>
        ),
      },
      createActionsColumn<User>({
        onEdit: (user) => setEditingUser(user),
        onDelete: (user) => setDeletingUser(user),
        viewHref: (user) => `/dashboard/admin/manage/users/${user.id}`,
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

        <div className="mt-6">
          <DataTable
            columns={columns}
            data={users}
            searchPlaceholder="Search users..."
          />
        </div>
      </div>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleEditSave}
        />
      )}

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
                {deletingUser?.name}
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

function EditUserDialog({
  user,
  open,
  onClose,
  onSave,
}: {
  user: User;
  open: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}) {
  const [name, setName] = useState(user.name);
  const [dob, setDob] = useState(user.dob);
  const [employeeId, setEmployeeId] = useState(user.employeeId);
  const [role, setRole] = useState(user.role);
  const [joiningDate, setJoiningDate] = useState(user.joiningDate);
  const [machineAccess, setMachineAccess] = useState<string[]>(
    user.machineAccess,
  );

  function toggleMachine(machine: string) {
    setMachineAccess((prev) =>
      prev.includes(machine)
        ? prev.filter((m) => m !== machine)
        : [...prev, machine],
    );
  }

  function handleSave() {
    onSave({
      ...user,
      name,
      dob,
      employeeId,
      role,
      joiningDate,
      machineAccess: role === "operator" ? machineAccess : [],
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage src={user.photoUrl} alt={name} />
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              Photo editing not wired up yet
            </span>
          </div>

          <div>
            <Label className="text-xs">Name</Label>
            <Input
              className="mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Date of Birth</Label>
              <Input
                type="date"
                className="mt-1.5"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Employee ID</Label>
              <Input
                className="mt-1.5"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Role</Label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <Card
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`flex h-11 cursor-pointer items-center justify-center border-border text-xs font-medium transition-colors ${
                    role === r.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "bg-card/40 text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {r.label}
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Joining Date</Label>
            <Input
              type="date"
              className="mt-1.5"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
            />
          </div>

          {role === "operator" && (
            <div className="rounded-lg border border-border bg-card/40 p-4">
              <p className="text-sm font-medium text-foreground">
                Manage Access
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {MACHINES.map((machine) => {
                  const selected = machineAccess.includes(machine);
                  return (
                    <Card
                      key={machine}
                      onClick={() => toggleMachine(machine)}
                      className={`flex h-11 cursor-pointer items-center justify-center border-border text-xs font-medium transition-colors ${
                        selected
                          ? "border-green-500/60 bg-green-500/10 text-green-600"
                          : "bg-card/40 text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {machine}
                    </Card>
                  );
                })}
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
