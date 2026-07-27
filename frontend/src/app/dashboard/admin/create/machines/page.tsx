"use client";

import { useMemo, useState } from "react";
import { RequireRole } from "@/components/RequireRole";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function CreateMachinePage() {
  const [selectedType, setSelectedType] = useState<MachineTypeDef | null>(null);
  const [machineNumber, setMachineNumber] = useState(1);
  const [machineName, setMachineName] = useState("");
  const [nameManuallyEdited, setNameManuallyEdited] = useState(false);

  const [testSiteCount, setTestSiteCount] = useState(4);
  const [startingNumber, setStartingNumber] = useState(73);

  const [createdDate] = useState(() => todayISO());

  function selectType(type: MachineTypeDef) {
    setSelectedType(type);
    if (!nameManuallyEdited) {
      setMachineName(`${type.label}-${machineNumber}`);
    }
  }

  function updateMachineNumber(num: number) {
    setMachineNumber(num);
    if (!nameManuallyEdited && selectedType) {
      setMachineName(`${selectedType.label}-${num}`);
    }
  }

  function handleNameChange(value: string) {
    setMachineName(value);
    setNameManuallyEdited(true);
  }

  const generatedTestSites = useMemo(() => {
    return Array.from(
      { length: testSiteCount },
      (_, i) => `T${startingNumber + i}`,
    );
  }, [testSiteCount, startingNumber]);

  const previewTestSite = generatedTestSites[0] ?? "T—";

  const previewPoints = useMemo(() => {
    if (!selectedType) return [];
    return Array.from(
      { length: selectedType.points },
      (_, i) => `${previewTestSite}.${i + 1}`,
    );
  }, [selectedType, previewTestSite]);

  function handleSubmit() {
    const payload = {
      machineType: selectedType?.value ?? null,
      machineName,
      pointsPerTestSite: selectedType?.points ?? null,
      testSites: generatedTestSites,
      createdDate,
    };

    console.log("CREATE MACHINE:", payload);
  }

  const isComplete =
    !!selectedType &&
    machineName.trim() !== "" &&
    generatedTestSites.length > 0;

  return (
    <RequireRole roles={["admin"]}>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-lg font-semibold text-foreground">
          Create Machine
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Register a new machine and its test sites.
        </p>

        {/* Machine type */}
        <div className="mt-8">
          <Label className="text-xs">Machine Type</Label>
          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {MACHINE_TYPES.map((type) => (
              <Card
                key={type.value}
                onClick={() => selectType(type)}
                className={`flex h-16 cursor-pointer flex-col items-center justify-center gap-0.5 border-border text-center transition-colors ${
                  selectedType?.value === type.value
                    ? "border-primary bg-primary/10"
                    : "bg-card/40 hover:border-primary/50"
                }`}
              >
                <span className="text-sm font-medium text-foreground">
                  {type.label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {type.points} points / site
                </span>
              </Card>
            ))}
          </div>
        </div>

        {/* Machine name */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Machine Number</Label>
            <Input
              type="number"
              min={1}
              className="mt-1.5"
              value={machineNumber}
              onChange={(e) =>
                updateMachineNumber(Math.max(1, Number(e.target.value) || 1))
              }
              disabled={!selectedType}
            />
          </div>
          <div>
            <Label className="text-xs">Machine Name</Label>
            <Input
              className="mt-1.5"
              value={machineName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Select a machine type first"
              disabled={!selectedType}
            />
          </div>
        </div>

        {/* Test site count + starting number */}
        <div className="mt-8 rounded-lg border border-border bg-card/40 p-5">
          <p className="text-sm font-medium text-foreground">Test Sites</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose how many test sites to create and their starting number.
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

          {/* Generated test site codes preview — mirrors the reference grid */}
          <div className="mt-5">
            <p className="text-xs text-muted-foreground">
              Generated test sites
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {generatedTestSites.map((site, i) => (
                <Card
                  key={site}
                  className={`flex h-12 items-center justify-center border-border text-sm font-medium ${
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

        {/* Visual showcase of points within one test site */}
        <div className="mt-8 rounded-lg border border-border bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Test Point Layout Preview
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Shows the {selectedType?.points ?? "—"} points inside a single
                test site (e.g. {previewTestSite}) for this machine type.
              </p>
            </div>
            {selectedType && (
              <Badge variant="secondary">{selectedType.points} points</Badge>
            )}
          </div>

          {selectedType ? (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {previewPoints.map((point) => (
                <Card
                  key={point}
                  className="flex h-14 items-center justify-center border-border bg-background/40 text-sm font-medium text-foreground"
                >
                  {point}
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex h-20 items-center justify-center text-sm text-muted-foreground">
              Select a machine type to preview its point layout
            </div>
          )}
        </div>

        {/* Auto-filled metadata */}
        <div className="mt-8 w-40">
          <Label className="text-xs">Created Date</Label>
          <Input
            className="mt-1.5 text-muted-foreground"
            value={createdDate}
            disabled
          />
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSubmit} disabled={!isComplete}>
            Create Machine
          </Button>
        </div>
      </div>
    </RequireRole>
  );
}
