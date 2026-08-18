import { api } from "@/lib/api";

export interface UserSummary {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone_number: string | null;
  created_at: string;
}

export interface UpdateUserPayload {
  full_name: string;
  email: string;
  role: string;
  phone_number: string;
}

export async function listUsers() {
  const res = await api.get<UserSummary[]>("/users");
  return res.data;
}

export async function getUser(id: string) {
  const res = await api.get<UserSummary>(`/users/${id}`);
  return res.data;
}

export async function updateUser(id: string, payload: UpdateUserPayload) {
  const res = await api.put<UserSummary>(`/users/${id}`, payload);
  return res.data;
}

export async function resetUserPassword(id: string, newPassword: string) {
  await api.patch(`/users/${id}/password`, { newPassword });
}

export async function deleteUser(id: string) {
  await api.delete(`/users/${id}`);
}

export function avatarFor(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
}
