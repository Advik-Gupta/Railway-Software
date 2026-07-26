"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadForm } from "./UploadForm";
import { UploadSummary } from "./UploadSummary";
import { NomenclatureForm } from "./NomenclatureForm";
import { UploadSelection, UploadValues } from "@/components/uploads/types";
import {
  emptyNomenclature,
  type NomenclatureValues,
} from "@/components/uploads/types";

// --- Placeholder data — swap for real API data later ---
const MACHINES = ["RGI96-01", "RGI96-02", "SRGM-01", "LRG-01", "FM-SWR"];
const CYCLE_TYPES = ["Grind Cycle", "Maintenance Cycle"] as const;
const CYCLE_NUMBERS = ["Cycle 01", "Cycle 02", "Cycle 03"];
const TEST_POINTS = ["T1", "T2", "T3"];
const DATA_STAGES = ["Pre-grinding", "Grinding", "Post-grinding"] as const;
// Each test point has 6 sub-points, e.g. T1.1 ... T1.6
const subPointsFor = (testPoint: string) =>
  Array.from({ length: 6 }, (_, i) => `${testPoint}.${i + 1}`);

const STEP_LABELS = [
  "Machine",
  "Cycle Type",
  "Cycle Number",
  "Test Point",
  "Data Stage",
  "Test Site Point",
] as const;

const emptySelection: UploadSelection = {
  machine: null,
  cycleType: null,
  cycleNumber: null,
  testPoint: null,
  dataStage: null,
  testSitePoint: null,
};

type Stage = "wizard" | "form" | "summary" | "nomenclature";

const SELECTION_KEYS: (keyof UploadSelection)[] = [
  "machine",
  "cycleType",
  "cycleNumber",
  "testPoint",
  "dataStage",
  "testSitePoint",
];

export default function UploadPage() {
  const [selection, setSelection] = useState<UploadSelection>(emptySelection);
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<Stage>("wizard");
  const [uploadValues, setUploadValues] = useState<UploadValues>({});
  const [remarks, setRemarks] = useState("");
  const [nomenclature, setNomenclature] =
    useState<NomenclatureValues>(emptyNomenclature);

  function selectAndAdvance<K extends keyof UploadSelection>(
    key: K,
    value: string,
  ) {
    const next = { ...selection, [key]: value };
    setSelection(next);
    console.log("Upload selection updated:", next);
    setStep((s) => s + 1);
  }

  function goBack() {
    setStep((s) => {
      const newStep = Math.max(0, s - 1);
      const keyToClear = SELECTION_KEYS[newStep];
      if (keyToClear) {
        setSelection((prev) => {
          const next = { ...prev, [keyToClear]: null };
          console.log("Upload selection updated (went back):", next);
          return next;
        });
      }
      return newStep;
    });
  }

  function handleStartUpload() {
    console.log("Final selection, ready for nomenclature:", selection);
    setStage("nomenclature");
  }

  function resetWizard() {
    setSelection(emptySelection);
    setStep(0);
    setStage("wizard");
    setNomenclature(emptyNomenclature);
    setUploadValues({});
    setRemarks("");
  }

  if (stage === "nomenclature") {
    return (
      <NomenclatureForm
        values={nomenclature}
        onChange={setNomenclature}
        onBack={() => setStage("wizard")}
        onContinue={() => setStage("form")}
      />
    );
  }

  if (stage === "form") {
    return (
      <UploadForm
        selection={selection}
        values={uploadValues}
        remarks={remarks}
        onValuesChange={setUploadValues}
        onRemarksChange={setRemarks}
        onBack={() => setStage("nomenclature")}
        onContinue={() => setStage("summary")}
      />
    );
  }

  if (stage === "summary") {
    return (
      <UploadSummary
        selection={selection}
        values={uploadValues}
        remarks={remarks}
        onBack={() => setStage("form")}
        onSubmitted={resetWizard}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Breadcrumb selection={selection} />

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          {STEP_LABELS[step] ?? "Review"}
        </h1>
        {step > 0 && (
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ChevronLeft className="mr-1 size-4" />
            Back
          </Button>
        )}
      </div>

      <div className="mt-4">
        {step === 0 && (
          <SelectionGrid
            items={MACHINES}
            onSelect={(v) => selectAndAdvance("machine", v)}
          />
        )}

        {step === 1 && (
          <SelectionGrid
            items={CYCLE_TYPES as unknown as string[]}
            onSelect={(v) => selectAndAdvance("cycleType", v)}
          />
        )}

        {step === 2 && (
          <SelectionGrid
            items={CYCLE_NUMBERS}
            onSelect={(v) => selectAndAdvance("cycleNumber", v)}
          />
        )}

        {step === 3 && (
          <SelectionGrid
            items={TEST_POINTS}
            onSelect={(v) => selectAndAdvance("testPoint", v)}
          />
        )}

        {step === 4 && (
          <SelectionGrid
            items={DATA_STAGES as unknown as string[]}
            onSelect={(v) => selectAndAdvance("dataStage", v)}
          />
        )}

        {step === 5 && selection.testPoint && (
          <SelectionGrid
            items={subPointsFor(selection.testPoint)}
            onSelect={(v) => selectAndAdvance("testSitePoint", v)}
          />
        )}

        {step === 6 && (
          <div className="rounded-lg border border-border bg-card/40 p-6">
            <p className="text-sm text-muted-foreground">
              All selections complete. Ready to upload data for:
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Machine</dt>
              <dd className="text-foreground">{selection.machine}</dd>
              <dt className="text-muted-foreground">Cycle Type</dt>
              <dd className="text-foreground">{selection.cycleType}</dd>
              <dt className="text-muted-foreground">Cycle Number</dt>
              <dd className="text-foreground">{selection.cycleNumber}</dd>
              <dt className="text-muted-foreground">Test Point</dt>
              <dd className="text-foreground">{selection.testPoint}</dd>
              <dt className="text-muted-foreground">Data Stage</dt>
              <dd className="text-foreground">{selection.dataStage}</dd>
              <dt className="text-muted-foreground">Test Site Point</dt>
              <dd className="text-foreground">{selection.testSitePoint}</dd>
            </dl>
            <div className="mt-6 flex gap-3">
              <Button onClick={handleStartUpload}>Upload Data</Button>
              <Button variant="outline" onClick={resetWizard}>
                Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SelectionGrid({
  items,
  onSelect,
}: {
  items: string[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item}
          onClick={() => onSelect(item)}
          className="flex h-20 cursor-pointer items-center justify-center border-border bg-card/40 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-card"
        >
          {item}
        </Card>
      ))}
    </div>
  );
}

function Breadcrumb({ selection }: { selection: UploadSelection }) {
  const trail = [
    selection.machine,
    selection.cycleType,
    selection.cycleNumber,
    selection.testPoint,
    selection.dataStage,
    selection.testSitePoint,
  ].filter(Boolean);

  if (trail.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Select a machine to begin</p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      {trail.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span>/</span>}
          <span
            className={
              i === trail.length - 1 ? "font-medium text-foreground" : ""
            }
          >
            {crumb}
          </span>
        </span>
      ))}
    </div>
  );
}
