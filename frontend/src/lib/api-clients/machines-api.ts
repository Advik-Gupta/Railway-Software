import { api } from "@/lib/api";

export interface Machine {
  id: string;
  name: string;
  machine_type: string;
  assigned_engineer_id: string | null;
  created_by: string;
  created_at: string;
  test_site_count?: number;
}

export interface TestSiteDetailsPayload {
  division: string;
  curveType: string | null;
  curveNumber: string;
  degreeOfCurve: string;
  section: string;
  station: string;
  line: string | null;
  kmFrom: number;
  kmTo: number;
  gmtYear: number;
  nextGrindingDueDate: string;
  nextRepaintingDueDate: string;
}

export interface CreateMachinePayload {
  machineType: string;
  machineName: string;
  assignedEngineerId?: string;
  testSiteCount: number;
  startingNumber: number;
  testSiteDetails: TestSiteDetailsPayload;
}

export interface TestSite {
  id: string;
  machine_id: string;
  test_site_number: string;
  [key: string]: unknown;
}

export interface Point {
  id: string;
  test_site_id: string;
  point_name: string;
}

export interface TestSiteWithPoints {
  testSite: TestSite;
  points: Point[];
}

export interface CreateMachineResult {
  machine: Machine;
  testSites: TestSiteWithPoints[];
}

export async function createMachine(payload: CreateMachinePayload) {
  const res = await api.post<CreateMachineResult>("/machines", payload);
  return res.data;
}

export async function listMachines() {
  const res = await api.get<Machine[]>("/machines");
  return res.data;
}

export async function getMachine(id: string) {
  const res = await api.get<{ machine: Machine; testSites: TestSite[] }>(
    `/machines/${id}`,
  );
  return res.data;
}

export async function deleteMachine(id: string) {
  await api.delete(`/machines/${id}`);
}
