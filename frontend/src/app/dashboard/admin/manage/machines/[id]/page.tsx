"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getMachine,
  assignEngineer,
  type Machine,
  type TestSite,
} from "@/lib/api-clients/machines-api";
import { listUsers, type UserSummary } from "@/lib/api-clients/users-api";

const MACHINE_TYPE_LABELS: Record<string, string> = {
  RGI96: "RGI96",
  SRGM: "SRGM",
  LRG: "LRG",
  FM: "FM",
  CMRL_VRA: "CMRL (VRA)",
};

export default function MachineDetailPage() {
  const params = useParams<{ id: string }>();
  const machineId = params.id;

  const [machine, setMachine] = useState<Machine | null>(null);
  const [testSites, setTestSites] = useState<TestSite[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string | null>(
    null,
  );
  const [comboOpen, setComboOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [machineData, usersData] = await Promise.all([
        getMachine(machineId),
        listUsers(),
      ]);
      setMachine(machineData.machine);
      setTestSites(machineData.testSites);
      setUsers(usersData);
      setSelectedEngineerId(machineData.machine.assigned_engineer_id ?? null);
    } catch {
      setError("Could not load machine. Is the server running?");
    } finally {
      setLoading(false);
    }
  }, [machineId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAssign() {
    setSaving(true);
    setError(null);
    try {
      const updated = await assignEngineer(machineId, selectedEngineerId);
      setMachine(updated);
    } catch {
      setError("Could not assign engineer.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 text-sm text-muted-foreground">
        Loading machine...
      </div>
    );
  }

  if (error && !machine) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!machine) return null;

  const selectedUser = users.find((u) => u.id === selectedEngineerId);
  const hasChanges =
    selectedEngineerId !== (machine.assigned_engineer_id ?? null);

  return (
    <RequireRole roles={["admin"]}>
      <div className="mx-auto max-w-4xl min-w-0 px-6 py-10">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground">
            {machine.name}
          </h1>
          <Badge variant="secondary">
            {MACHINE_TYPE_LABELS[machine.machine_type] ?? machine.machine_type}
          </Badge>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Created {new Date(machine.created_at).toLocaleDateString()}
        </p>

        {error && (
          <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Assigned Engineer */}
        <Card className="mt-8 border-border bg-card/40 p-5">
          <p className="text-sm font-semibold text-foreground">
            Assigned Engineer
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            The engineer primarily responsible for this machine.
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[260px] flex-1">
              <Label className="text-xs">Engineer</Label>
              <Popover open={comboOpen} onOpenChange={setComboOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      className="mt-1.5 w-full justify-between font-normal"
                    />
                  }
                >
                  {selectedUser
                    ? `${selectedUser.full_name} (${selectedUser.role})`
                    : "Unassigned"}
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandList>
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="unassigned"
                          onSelect={() => {
                            setSelectedEngineerId(null);
                            setComboOpen(false);
                          }}
                          className="mb-1 py-2.5 last:mb-0 data-selected:bg-accent data-selected:text-accent-foreground"
                        >
                          <Check
                            className={cn(
                              "mr-2 size-4 shrink-0",
                              selectedEngineerId === null
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span className="text-xs">Unassigned</span>
                        </CommandItem>

                        {users.map((u) => (
                          <CommandItem
                            key={u.id}
                            value={`${u.full_name} ${u.email}`}
                            onSelect={() => {
                              setSelectedEngineerId(u.id);
                              setComboOpen(false);
                            }}
                            className="mb-1 py-2.5 last:mb-0 data-selected:bg-accent data-selected:text-accent-foreground"
                          >
                            <Check
                              className={cn(
                                "mr-2 size-4 shrink-0",
                                selectedEngineerId === u.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate text-xs font-medium text-foreground">
                                {u.full_name}
                              </span>
                              <span className="truncate text-[0.65rem] text-muted-foreground">
                                {u.email} · {u.role}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={handleAssign} disabled={!hasChanges || saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </Card>

        {/* Test Sites */}
        <Card className="mt-6 border-border bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Test Sites</p>
            <Badge variant="secondary">{testSites.length} sites</Badge>
          </div>

          <div className="mt-4 space-y-3">
            {testSites.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No test sites yet.
              </p>
            )}

            {testSites.map((ts) => (
              <Card key={ts.id} className="border-border bg-background/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    {ts.test_site_number}
                  </p>
                  {ts.line && <Badge variant="outline">{ts.line} line</Badge>}
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs sm:grid-cols-3">
                  <dt className="text-muted-foreground">Division</dt>
                  <dd className="text-foreground sm:col-span-2">
                    {ts.division || "—"}
                  </dd>

                  <dt className="text-muted-foreground">Section</dt>
                  <dd className="text-foreground sm:col-span-2">
                    {ts.section || "—"}
                  </dd>

                  <dt className="text-muted-foreground">Station</dt>
                  <dd className="text-foreground sm:col-span-2">
                    {ts.station || "—"}
                  </dd>

                  <dt className="text-muted-foreground">Curve</dt>
                  <dd className="text-foreground sm:col-span-2">
                    {ts.curve_type || "—"}
                    {ts.curve_number ? ` · #${ts.curve_number}` : ""}
                    {ts.degree_of_curve ? ` · ${ts.degree_of_curve}°` : ""}
                  </dd>

                  <dt className="text-muted-foreground">KM Range</dt>
                  <dd className="text-foreground sm:col-span-2">
                    {ts.km_from ?? "—"} – {ts.km_to ?? "—"}
                  </dd>

                  <dt className="text-muted-foreground">GMT / Year</dt>
                  <dd className="text-foreground sm:col-span-2">
                    {ts.annual_gmt ?? "—"}
                  </dd>

                  <dt className="text-muted-foreground">Grinding Due</dt>
                  <dd className="text-foreground sm:col-span-2">
                    {ts.next_grinding_due_date || "Not set"}
                  </dd>

                  <dt className="text-muted-foreground">Repainting Due</dt>
                  <dd className="text-foreground sm:col-span-2">
                    {ts.next_repainting_due_date || "Not set"}
                  </dd>
                </dl>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </RequireRole>
  );
}
