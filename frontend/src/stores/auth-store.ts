import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role =
  | "operator"
  | "supervisor"
  | "machine_incharge"
  | "fleet_manager"
  | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setSession: (token, user) => set({ accessToken: token, user }),
      logout: () => set({ accessToken: null, user: null }),
    }),
    { name: "vandhana-auth" },
  ),
);
