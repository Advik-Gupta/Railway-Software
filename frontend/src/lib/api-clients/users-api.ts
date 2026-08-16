import { api } from "@/lib/api";

export interface UserSummary {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export async function listUsers() {
  const res = await api.get<UserSummary[]>("/users");
  return res.data;
}
