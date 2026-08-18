"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listUsers,
  getUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  type UpdateUserPayload,
} from "@/lib/api-clients/users-api";
import { userKeys } from "@/lib/query-keys";

export function useUsersList() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: listUsers,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(userKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User updated");
    },
    onError: () => {
      toast.error("Could not update user");
    },
  });
}

export function useResetPassword(id: string) {
  return useMutation({
    mutationFn: (newPassword: string) => resetUserPassword(id, newPassword),
    onSuccess: () => {
      toast.success("Password reset");
    },
    onError: () => {
      toast.error("Could not reset password");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User deleted");
    },
    onError: () => {
      toast.error("Could not delete user");
    },
  });
}
