"use client";

import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ROLES = [
  { value: "operator", label: "Operator" },
  { value: "supervisor", label: "Supervisor" },
  { value: "machine_incharge", label: "Machine In-charge" },
  { value: "fleet_manager", label: "Fleet Manager" },
  { value: "admin", label: "Admin" },
];

const MACHINES = ["RGI96-01", "RGI96-02", "SRGM-01", "LRG-01", "FM-SWR"];

function generateEmployeeId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `VIPL-${num}`;
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
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
  ) {
    age--;
  }
  return age;
}

export default function CreateUserPage() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [joiningDate, setJoiningDate] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState(() => generateEmployeeId());
  const [employeeIdEditable, setEmployeeIdEditable] = useState(false);

  const [password, setPassword] = useState(() => generatePassword());
  const [passwordEditable, setPasswordEditable] = useState(false);

  const [machineAccess, setMachineAccess] = useState<string[]>([]);

  const age = useMemo(() => calculateAge(dob), [dob]);

  const defaultAvatarUrl = useMemo(() => {
    const displayName = name.trim() || "John Doe";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;
  }, [name]);

  function handlePhotoSelected(file: File | undefined) {
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function toggleMachine(machine: string) {
    setMachineAccess((prev) =>
      prev.includes(machine)
        ? prev.filter((m) => m !== machine)
        : [...prev, machine],
    );
  }

  function handleSubmit() {
    const payload = {
      name,
      dob,
      age,
      employeeId,
      role,
      password,
      joiningDate,
      photoFile,
      photoUrl: photoPreview ?? defaultAvatarUrl,
      machineAccess: role === "operator" ? machineAccess : undefined,
    };
    // TODO: replace with real API call once backend endpoint exists
    console.log("CREATE USER:", payload);
  }

  return (
    <RequireRole roles={["admin"]}>
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-lg font-semibold text-foreground">Create User</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new user and assign their role and access.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={photoPreview ?? defaultAvatarUrl} alt={name} />
            <AvatarFallback>
              {(name || "JD").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <Label
              htmlFor="photo"
              className="cursor-pointer text-sm text-primary hover:underline"
            >
              Upload photo
            </Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoSelected(e.target.files?.[0])}
            />
            <p className="mt-0.5 text-xs text-muted-foreground">
              Defaults to a generated avatar if none is uploaded.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <Label className="text-xs">Name</Label>
            <Input
              className="mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
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
              <Label className="text-xs">Age</Label>
              <Input
                className="mt-1.5"
                value={age !== null ? `${age} years` : ""}
                disabled
                placeholder="Auto-calculated"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Employee ID</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={!employeeIdEditable}
                className={!employeeIdEditable ? "text-muted-foreground" : ""}
              />
              <button
                type="button"
                onClick={() => setEmployeeIdEditable((v) => !v)}
                className="shrink-0 rounded-md border border-border p-2 hover:bg-accent"
              >
                <Pencil className="size-3.5" />
              </button>
            </div>
          </div>

          <div>
            <Label className="text-xs">Role</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ROLES.map((r) => (
                <Card
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`flex h-12 cursor-pointer items-center justify-center border-border text-xs font-medium transition-colors ${
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
            <Label className="text-xs">Password</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!passwordEditable}
                className={!passwordEditable ? "text-muted-foreground" : ""}
              />
              <button
                type="button"
                onClick={() => setPasswordEditable((v) => !v)}
                className="shrink-0 rounded-md border border-border p-2 hover:bg-accent"
              >
                <Pencil className="size-3.5" />
              </button>
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
              <p className="mt-1 text-xs text-muted-foreground">
                Select which machines this operator can access.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {MACHINES.map((machine) => {
                  const selected = machineAccess.includes(machine);
                  return (
                    <Card
                      key={machine}
                      onClick={() => toggleMachine(machine)}
                      className={`flex h-12 cursor-pointer items-center justify-center border-border text-xs font-medium transition-colors ${
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

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSubmit}>Create User</Button>
        </div>
      </div>
    </RequireRole>
  );
}
