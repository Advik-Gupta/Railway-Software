"use client";

import { useRef, useState } from "react";
import {
  ChevronLeft,
  Upload as UploadIcon,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ALL_UPLOAD_FIELDS, type UploadFieldDef } from "@/lib/upload-fields";
import { ImageCropDialog } from "@/components/uploads/ImageCropDialog";
import type {
  UploadSelection,
  UploadValues,
  UploadFieldValue,
} from "@/components/uploads/types";

interface UploadFormProps {
  selection: UploadSelection;
  values: UploadValues;
  remarks: string;
  onValuesChange: (values: UploadValues) => void;
  onRemarksChange: (remarks: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function isFilled(value?: UploadFieldValue) {
  if (!value) return false;
  return !!value.file || !!value.numericValue;
}

export function UploadForm({
  selection,
  values,
  remarks,
  onValuesChange,
  onRemarksChange,
  onBack,
  onContinue,
}: UploadFormProps) {
  const [cropTargetKey, setCropTargetKey] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function updateValue(key: string, patch: Partial<UploadFieldValue>) {
    const next = { ...values, [key]: { ...values[key], ...patch } };
    onValuesChange(next);
    console.log("Upload values updated:", next);
  }

  function clearValue(key: string) {
    const next = { ...values };
    delete next[key];
    onValuesChange(next);
    console.log("Upload values updated (cleared):", next);
  }

  function openPicker(key: string) {
    fileInputRefs.current[key]?.click();
  }

  function handleImageFileSelected(key: string, file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropTargetKey(key);
      setCropImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleEditImage(key: string) {
    const raw = values[key]?.rawSrc;
    if (!raw) {
      openPicker(key);
      return;
    }
    setCropTargetKey(key);
    setCropImageSrc(raw);
  }

  function handleCropSave(blob: Blob) {
    if (!cropTargetKey) return;
    updateValue(cropTargetKey, {
      file: blob,
      fileName: `${cropTargetKey}.jpg`,
      rawSrc: cropImageSrc ?? undefined,
    });
    setCropTargetKey(null);
    setCropImageSrc(null);
  }

  function handleGenericFileSelected(key: string, file: File | undefined) {
    if (!file) return;
    updateValue(key, { file, fileName: file.name });
  }

  function handleNumberChange(key: string, raw: string) {
    if (raw.trim() === "") {
      clearValue(key);
      return;
    }
    updateValue(key, { numericValue: raw });
  }

  const filledCount = ALL_UPLOAD_FIELDS.filter((f) =>
    isFilled(values[f.key]),
  ).length;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ChevronLeft className="mr-1 size-4" />
        Back
      </Button>

      <h1 className="mt-4 text-lg font-semibold text-foreground">
        Upload Data
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {selection.machine} — {selection.testSitePoint} — {selection.dataStage}
      </p>
      <Badge variant="secondary" className="mt-2">
        {filledCount} / {ALL_UPLOAD_FIELDS.length} fields filled
      </Badge>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {ALL_UPLOAD_FIELDS.map((field) => (
          <UploadFieldBox
            key={field.key}
            field={field}
            value={values[field.key]}
            onUploadClick={() => openPicker(field.key)}
            onEditClick={() => handleEditImage(field.key)}
            onDeleteClick={() => clearValue(field.key)}
            onNumberChange={(v) => handleNumberChange(field.key, v)}
            onGenericFile={(f) => handleGenericFileSelected(field.key, f)}
            registerFileInput={(el) => {
              fileInputRefs.current[field.key] = el;
            }}
            onImageFile={(f) => handleImageFileSelected(field.key, f)}
          />
        ))}
      </div>

      <div className="mt-8">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          value={remarks}
          onChange={(e) => onRemarksChange(e.target.value)}
          placeholder="Add any notes for the supervisor..."
          className="mt-2 min-h-24"
        />
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={onContinue}>Continue to review</Button>
      </div>

      <ImageCropDialog
        open={!!cropTargetKey}
        imageSrc={cropImageSrc}
        onClose={() => {
          setCropTargetKey(null);
          setCropImageSrc(null);
        }}
        onSave={handleCropSave}
      />
    </div>
  );
}

function UploadFieldBox({
  field,
  value,
  onUploadClick,
  onEditClick,
  onDeleteClick,
  onNumberChange,
  onGenericFile,
  registerFileInput,
  onImageFile,
}: {
  field: UploadFieldDef;
  value?: UploadFieldValue;
  onUploadClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onNumberChange: (v: string) => void;
  onGenericFile: (f: File | undefined) => void;
  registerFileInput: (el: HTMLInputElement | null) => void;
  onImageFile: (f: File | undefined) => void;
}) {
  const filled = isFilled(value);

  if (field.type === "number") {
    return (
      <div className="flex h-28 flex-col gap-1.5">
        <Label className="text-xs">{field.label}</Label>
        <Input
          type="number"
          value={value?.numericValue ?? ""}
          onChange={(e) => onNumberChange(e.target.value)}
          placeholder="Enter value"
          className={filled ? "border-primary" : ""}
        />
      </div>
    );
  }

  // image and file types share the same filled/unfilled visual treatment
  const isImage = field.type === "image";

  return (
    <div className="flex h-28 flex-col gap-1.5">
      <Label className="text-xs">{field.label}</Label>
      <Card
        className={`relative flex flex-1 flex-col items-center justify-center gap-1 border-border text-xs transition-colors ${
          filled
            ? "border-green-500/60 bg-green-500/10"
            : "cursor-pointer bg-card/40 hover:border-primary/50"
        }`}
        onClick={filled ? undefined : onUploadClick}
      >
        {filled ? (
          <>
            <Check className="size-5 text-green-500" />
            <span className="text-[10px] text-green-600">Uploaded</span>
            <div className="absolute right-1.5 top-1.5 flex gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick();
                }}
                className="rounded-full bg-background/90 p-1 hover:bg-background"
              >
                <Pencil className="size-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick();
                }}
                className="rounded-full bg-background/90 p-1 hover:bg-background"
              >
                <Trash2 className="size-3 text-destructive" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <UploadIcon className="size-4" />
            <span>Upload</span>
          </div>
        )}

        <input
          ref={registerFileInput}
          type="file"
          accept={isImage ? "image/*" : undefined}
          className="hidden"
          onChange={(e) =>
            isImage
              ? onImageFile(e.target.files?.[0])
              : onGenericFile(e.target.files?.[0])
          }
        />
      </Card>
    </div>
  );
}
