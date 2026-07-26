export type CycleType = "Grind Cycle" | "Maintenance Cycle";
export type DataStage = "Pre-grinding" | "Grinding" | "Post-grinding";

export interface UploadSelection {
  machine: string | null;
  cycleType: CycleType | null;
  cycleNumber: string | null;
  testPoint: string | null;
  dataStage: DataStage | null;
  testSitePoint: string | null;
}

export interface UploadFieldValue {
  file?: Blob;
  fileName?: string;
  rawSrc?: string;
  numericValue?: string;
}

export type UploadValues = Record<string, UploadFieldValue>;

export interface NomenclatureValues {
  testSiteNumber: string;
  customerName: string | null; // IR / CMRL / DFCCIL / DMRC / BMRC / SWR
  zone: string;
  location: string;
  line: string | null; // UP / DN / SL / ML / BL
  targetCurveNo: string;
  rail: string | null; // Left / Right / Low / High
  date: string;
}

export const emptyNomenclature: NomenclatureValues = {
  testSiteNumber: "",
  customerName: null,
  zone: "",
  location: "",
  line: null,
  targetCurveNo: "",
  rail: null,
  date: "",
};
