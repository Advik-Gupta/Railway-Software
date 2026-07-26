export type UploadFieldType = "image" | "file" | "number";

export interface UploadFieldDef {
  key: string;
  label: string;
  type: UploadFieldType;
}

export const ALL_UPLOAD_FIELDS: UploadFieldDef[] = [
  { key: "top_view", label: "Top View", type: "image" },
  { key: "dpt", label: "DPT", type: "image" },
  { key: "contact_band", label: "Contact Band", type: "image" },
  { key: "gauge_view", label: "Gauge View", type: "image" },
  { key: "longitudinal_view", label: "Longitudinal View", type: "image" },
  { key: "star_gauge", label: "Star Gauge", type: "image" },
  { key: "miniprof_w", label: "MiniProf — W File", type: "file" },
  { key: "miniprof_ban", label: "MiniProf — Ban File", type: "file" },
  { key: "surface_hardness", label: "Surface Hardness", type: "number" },
  { key: "surface_roughness", label: "Surface Roughness", type: "number" },
];
