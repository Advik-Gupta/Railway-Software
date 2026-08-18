"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RequireRole } from "@/components/RequireRole";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
  useUser,
  useUpdateUser,
  useResetPassword,
  useDeleteUser,
} from "@/hooks/use-users";
import { avatarFor } from "@/lib/api-clients/users-api";
import Link from "next/link";
import { useMachinesByEngineer, useAssignEngineer } from "@/hooks/use-machines";
import { UserDetailSkeleton } from "@/components/skeletons/UserDetailSkeleton";

const ROLES = [
  { value: "operator", label: "Operator" },
  { value: "supervisor", label: "Supervisor" },
  { value: "machine_incharge", label: "Machine In-charge" },
  { value: "fleet_manager", label: "Fleet Manager" },
  { value: "admin", label: "Admin" },
];

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const router = useRouter();

  const { data: user, isLoading, isError } = useUser(userId);
  const updateUser = useUpdateUser(userId);
  const resetPassword = useResetPassword(userId);
  const deleteUser = useDeleteUser();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: assignedMachines = [], isLoading: machinesLoading } =
    useMachinesByEngineer(userId);
  const revokeAccess = useAssignEngineer();
  const [revokingMachineId, setRevokingMachineId] = useState<string | null>(
    null,
  );

  function handleRevoke(machineId: string) {
    setRevokingMachineId(machineId);
    revokeAccess.mutate(
      { machineId, engineerId: null },
      { onSettled: () => setRevokingMachineId(null) },
    );
  }

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setEmail(user.email);
      setRole(user.role);
      setPhoneNumber(user.phone_number ?? "");
    }
  }, [user]);

  function handleSave() {
    updateUser.mutate({
      full_name: fullName,
      email,
      role,
      phone_number: phoneNumber,
    });
  }

  function handleResetPassword() {
    if (newPassword.length < 8) return;
    resetPassword.mutate(newPassword, {
      onSuccess: () => {
        setNewPassword("");
        setResetDialogOpen(false);
      },
    });
  }

  function handleDelete() {
    deleteUser.mutate(userId, {
      onSuccess: () => router.push("/dashboard/admin/manage/users"),
    });
  }

  if (isLoading) return <UserDetailSkeleton />;

  if (isError || !user) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 text-sm text-destructive">
        Could not load user. Is the server running?
      </div>
    );
  }

  const hasChanges =
    fullName !== user.full_name ||
    email !== user.email ||
    role !== user.role ||
    phoneNumber !== (user.phone_number ?? "");

  return (
    <RequireRole roles={["admin"]}>
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={avatarFor(user.full_name)} alt={user.full_name} />
            <AvatarFallback>
              {user.full_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {user.full_name}
            </h1>
            <Badge variant="secondary" className="mt-1">
              {ROLES.find((r) => r.value === user.role)?.label ?? user.role}
            </Badge>
          </div>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Joined {new Date(user.created_at).toLocaleDateString()}
        </p>

        {/* Editable details */}
        <Card className="mt-8 border-border bg-card/40 p-5">
          <p className="text-sm font-semibold text-foreground">Details</p>

          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-xs">Full Name</Label>
              <Input
                className="mt-1.5"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                className="mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs">Phone Number</Label>
              <Input
                className="mt-1.5"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Not set"
              />
            </div>

            <div>
              <Label className="text-xs">Role</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
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
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateUser.isPending}
            >
              {updateUser.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>

        {/* Assigned Machines */}
        <Card className="mt-6 border-border bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Assigned Machines
            </p>
            <Badge variant="secondary">{assignedMachines.length}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Machines this user is the primary responsible engineer for.
          </p>

          <div className="mt-4 space-y-2">
            {machinesLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))
            ) : assignedMachines.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No machines assigned.
              </p>
            ) : (
              assignedMachines.map((machine) => (
                <div
                  key={machine.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-4 py-3"
                >
                  <div>
                    <Link
                      href={`/dashboard/admin/manage/machines/${machine.id}`}
                      className="text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                    >
                      {machine.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {machine.machine_type}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevoke(machine.id)}
                    disabled={revokingMachineId === machine.id}
                  >
                    {revokingMachineId === machine.id
                      ? "Revoking..."
                      : "Revoke Access"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="mt-6 border-destructive/30 bg-destructive/5 p-5">
          <p className="text-sm font-semibold text-destructive">Danger Zone</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setResetDialogOpen(true)}>
              Reset Password
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete User
            </Button>
          </div>
        </Card>
      </div>

      {/* Reset password dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset password</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Set a new password for {user.full_name}. Theyll need this to
                  log in.
                </p>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewPassword("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPassword}
              disabled={newPassword.length < 8 || resetPassword.isPending}
            >
              {resetPassword.isPending ? "Resetting..." : "Reset Password"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {user.full_name}
              </span>
              ? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RequireRole>
  );
}
