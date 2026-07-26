"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NomenclatureValues } from "@/components/uploads/types";

const CUSTOMERS = ["IR", "CMRL", "DFCCIL", "DMRC", "BMRC", "SWR"];
const LINES = ["UP", "DN", "SL", "ML", "BL"];
const RAILS = ["Left Rail", "Right Rail", "Low Rail", "High Rail"];

interface NomenclatureFormProps {
  values: NomenclatureValues;
  onChange: (values: NomenclatureValues) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function NomenclatureForm({
  values,
  onChange,
  onBack,
  onContinue,
}: NomenclatureFormProps) {
  function set<K extends keyof NomenclatureValues>(
    key: K,
    value: NomenclatureValues[K],
  ) {
    const next = { ...values, [key]: value };
    onChange(next);
    console.log("Nomenclature updated:", next);
  }

  const isComplete = Object.values(values).every((v) => v !== null && v !== "");

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ChevronLeft className="mr-1 size-4" />
        Back
      </Button>

      <h1 className="mt-4 text-lg font-semibold text-foreground">
        Nomenclature
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        These details are required before uploading test data.
      </p>

      <div className="mt-6 space-y-6">
        <div>
          <Label className="text-xs">Test Site Number</Label>
          <Input
            className="mt-1.5"
            value={values.testSiteNumber}
            onChange={(e) => set("testSiteNumber", e.target.value)}
            placeholder="Enter number"
          />
        </div>

        <div>
          <Label className="text-xs">Customer Name</Label>
          <PickerGrid
            options={CUSTOMERS}
            selected={values.customerName}
            onSelect={(v) => set("customerName", v)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Zone</Label>
            <Input
              className="mt-1.5"
              value={values.zone}
              onChange={(e) => set("zone", e.target.value)}
              placeholder="Enter number"
            />
          </div>
          <div>
            <Label className="text-xs">Location</Label>
            <Input
              className="mt-1.5"
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Enter number"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs">Line</Label>
          <PickerGrid
            options={LINES}
            selected={values.line}
            onSelect={(v) => set("line", v)}
          />
        </div>

        <div>
          <Label className="text-xs">Target / Curve No</Label>
          <Input
            className="mt-1.5"
            value={values.targetCurveNo}
            onChange={(e) => set("targetCurveNo", e.target.value)}
            placeholder="Enter number"
          />
        </div>

        <div>
          <Label className="text-xs">Rail</Label>
          <PickerGrid
            options={RAILS}
            selected={values.rail}
            onSelect={(v) => set("rail", v)}
          />
        </div>

        <div>
          <Label className="text-xs">Date</Label>
          <Input
            type="date"
            className="mt-1.5 w-fit"
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={onContinue} disabled={!isComplete}>
          Continue to upload
        </Button>
      </div>
    </div>
  );
}

function PickerGrid({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string | null;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="mt-1.5 grid grid-cols-3 gap-2 sm:grid-cols-6">
      {options.map((opt) => (
        <Card
          key={opt}
          onClick={() => onSelect(opt)}
          className={`flex h-12 cursor-pointer items-center justify-center border-border text-xs font-medium transition-colors ${
            selected === opt
              ? "border-primary bg-primary/10 text-foreground"
              : "bg-card/40 text-muted-foreground hover:border-primary/50"
          }`}
        >
          {opt}
        </Card>
      ))}
    </div>
  );
}
