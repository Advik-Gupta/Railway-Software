"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, ChevronsUpDown, Plus, PowerOff } from "lucide-react";
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

  const [selectedTestSiteId, setSelectedTestSiteId] = useState<string | null>(
    null,
  );

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
      setSelectedTestSiteId(machineData.testSites[0]?.id ?? null);
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

  function handleCommissionNewTestSite() {
    // TODO: wire up — will open the test site creation flow
    console.log("COMMISSION NEW TEST SITE for machine:", machineId);
  }

  function handleDecommission(testSite: TestSite) {
    // TODO: wire up — will call the decommission endpoint
    console.log(
      "DECOMMISSION TEST SITE:",
      testSite.id,
      testSite.test_site_number,
    );
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

  const selectedTestSite =
    testSites.find((ts) => ts.id === selectedTestSiteId) ?? null;

  return (
    <RequireRole roles={["admin"]}>
      <div className="mx-auto max-w-6xl min-w-0 px-6 py-10">
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
            <div>
              <p className="text-sm font-semibold text-foreground">
                Test Sites
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Click a test site to view its details.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{testSites.length} sites</Badge>
              <Button size="sm" onClick={handleCommissionNewTestSite}>
                <Plus className="mr-1.5 size-3.5" />
                Commission New Test Site
              </Button>
            </div>
          </div>

          {testSites.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No test sites yet.
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              {/* Diagrammatic grid of test sites */}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {testSites.map((ts) => {
                  const isSelected = ts.id === selectedTestSiteId;
                  return (
                    <button
                      key={ts.id}
                      type="button"
                      onClick={() => setSelectedTestSiteId(ts.id)}
                      className={cn(
                        "flex h-16 flex-col items-center justify-center gap-0.5 rounded-lg border text-sm font-medium transition-colors",
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background/40 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                      )}
                    >
                      {ts.test_site_number}
                      {ts.line && (
                        <span className="text-[10px] font-normal opacity-70">
                          {ts.line}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Detail panel for the selected test site */}
              <Card className="border-border bg-background/40 p-4">
                {selectedTestSite ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {selectedTestSite.test_site_number}
                      </p>
                      {selectedTestSite.line && (
                        <Badge variant="outline">
                          {selectedTestSite.line} line
                        </Badge>
                      )}
                    </div>

                    <dl className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Division</dt>
                        <dd className="text-right text-foreground">
                          {selectedTestSite.division || "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Section</dt>
                        <dd className="text-right text-foreground">
                          {selectedTestSite.section || "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Station</dt>
                        <dd className="text-right text-foreground">
                          {selectedTestSite.station || "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Curve</dt>
                        <dd className="text-right text-foreground">
                          {selectedTestSite.curve_type || "—"}
                          {selectedTestSite.curve_number
                            ? ` · #${selectedTestSite.curve_number}`
                            : ""}
                          {selectedTestSite.degree_of_curve
                            ? ` · ${selectedTestSite.degree_of_curve}°`
                            : ""}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">KM Range</dt>
                        <dd className="text-right text-foreground">
                          {selectedTestSite.km_from ?? "—"} –{" "}
                          {selectedTestSite.km_to ?? "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">GMT / Year</dt>
                        <dd className="text-right text-foreground">
                          {selectedTestSite.annual_gmt ?? "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Grinding Due</dt>
                        <dd className="text-right text-foreground">
                          {selectedTestSite.next_grinding_due_date || "Not set"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">
                          Repainting Due
                        </dt>
                        <dd className="text-right text-foreground">
                          {selectedTestSite.next_repainting_due_date ||
                            "Not set"}
                        </dd>
                      </div>
                    </dl>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => handleDecommission(selectedTestSite)}
                    >
                      <PowerOff className="mr-1.5 size-3.5" />
                      Decommission Test Site
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select a test site to view its details.
                  </p>
                )}
              </Card>
            </div>
          )}
        </Card>
      </div>
    </RequireRole>
  );
}
