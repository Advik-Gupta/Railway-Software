"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
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
import { ALL_UPLOAD_FIELDS } from "@/lib/upload-fields";
import type { UploadSelection, UploadValues } from "@/components/uploads/types";

interface UploadSummaryProps {
  selection: UploadSelection;
  values: UploadValues;
  remarks: string;
  onBack: () => void;
  onSubmitted: () => void;
}

export function UploadSummary({
  selection,
  values,
  remarks,
  onBack,
  onSubmitted,
}: UploadSummaryProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  const filledFields = ALL_UPLOAD_FIELDS.filter((f) => isFilled(values[f.key]));
  const missingFields = ALL_UPLOAD_FIELDS.filter(
    (f) => !isFilled(values[f.key]),
  );

  function handleFinalConfirm() {
    const payload = {
      selection,
      values,
      remarks,
      filledFields: filledFields.map((f) => f.key),
      missingFields: missingFields.map((f) => f.key),
      submittedAt: new Date().toISOString(),
    };
    console.log("SUBMITTING UPLOAD:", payload);
    setConfirmOpen(false);
    onSubmitted();
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ChevronLeft className="mr-1 size-4" />
        Back to upload
      </Button>

      <h1 className="mt-4 text-lg font-semibold text-foreground">
        Review & Submit
      </h1>

      <dl className="mt-6 grid grid-cols-2 gap-y-2 text-sm">
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

      <div className="mt-6">
        <p className="text-sm font-medium text-foreground">Uploaded fields</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {filledFields.length === 0 && (
            <span className="text-sm text-muted-foreground">None yet</span>
          )}
          {filledFields.map((f) => (
            <Badge key={f.key} variant="secondary">
              {f.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-foreground">Missing fields</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {missingFields.length === 0 && (
            <span className="text-sm text-muted-foreground">
              All fields complete
            </span>
          )}
          {missingFields.map((f) => (
            <Badge
              key={f.key}
              variant="outline"
              className="border-destructive/50 text-destructive"
            >
              {f.label}
            </Badge>
          ))}
        </div>
      </div>

      {remarks && (
        <div className="mt-6">
          <p className="text-sm font-medium text-foreground">Remarks</p>
          <p className="mt-1 text-sm text-muted-foreground">{remarks}</p>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button onClick={() => setConfirmOpen(true)}>Upload</Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm submission</AlertDialogTitle>
            <AlertDialogDescription
              render={<div className="space-y-2 text-sm" />}
            >
              {missingFields.length > 0 ? (
                <>
                  <p>
                    The following fields are not uploaded yet:{" "}
                    <span className="font-medium text-foreground">
                      {missingFields.map((f) => f.label).join(", ")}
                    </span>
                    .
                  </p>
                  <p>
                    A 3-day timer starts now — you must upload these remaining
                    fields within 3 days, or this submission will be escalated
                    to your supervisor automatically.
                  </p>
                </>
              ) : (
                <p>All fields are complete.</p>
              )}
              <p>
                Your supervisor will be notified once you confirm this
                submission.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalConfirm}>
              Confirm & Upload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function isFilled(value?: { file?: Blob; numericValue?: string }) {
  if (!value) return false;
  return !!value.file || !!value.numericValue;
}
