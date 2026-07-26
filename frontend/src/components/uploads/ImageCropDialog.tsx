"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCroppedImageBlob } from "./crop-utils";

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onSave: (blob: Blob) => void;
}

export function ImageCropDialog({
  open,
  imageSrc,
  onClose,
  onSave,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // -180 to 180, any value
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function resetState() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  }

  async function handleSave() {
    if (!imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedImageBlob(
        imageSrc,
        croppedAreaPixels,
        rotation,
      );
      onSave(blob);
      resetState();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          resetState();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adjust image</DialogTitle>
        </DialogHeader>

        <div className="relative h-80 w-full overflow-hidden rounded-md bg-muted">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={4 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <div className="space-y-5 pt-2">
          <div>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Zoom</span>
              <span>{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Rotate</span>
              <span>{rotation}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>-180°</span>
              <button
                type="button"
                onClick={() => setRotation(0)}
                className="underline hover:text-foreground"
              >
                Reset
              </button>
              <span>180°</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetState();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !croppedAreaPixels}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
