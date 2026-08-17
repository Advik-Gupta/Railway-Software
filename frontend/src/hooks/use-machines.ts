"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listMachines,
  getMachine,
  createMachine,
  deleteMachine,
  assignEngineer,
  type CreateMachinePayload,
} from "@/lib/api-clients/machines-api";
import { listUsers } from "@/lib/api-clients/users-api";
import { machineKeys, userKeys } from "@/lib/query-keys";

export function useMachines() {
  return useQuery({
    queryKey: machineKeys.lists(),
    queryFn: listMachines,
  });
}

export function useMachine(id: string) {
  return useQuery({
    queryKey: machineKeys.detail(id),
    queryFn: () => getMachine(id),
    enabled: !!id,
  });
}

// Engineer names appear across many machine pages and change rarely —
// worth a longer staleTime than the default so switching between the
// machine list and detail pages doesn't keep re-fetching the same users.
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: listUsers,
    staleTime: 60_000,
  });
}

export function useCreateMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMachinePayload) => createMachine(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: machineKeys.lists() });
      toast.success("Machine created");
    },
    onError: () => {
      toast.error("Could not create machine");
    },
  });
}

export function useDeleteMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMachine(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: machineKeys.lists() });
      queryClient.removeQueries({ queryKey: machineKeys.detail(id) });
      toast.success("Machine deleted");
    },
    onError: () => {
      toast.error("Could not delete machine");
    },
  });
}

export function useAssignEngineer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      machineId,
      engineerId,
    }: {
      machineId: string;
      engineerId: string | null;
    }) => assignEngineer(machineId, engineerId),
    onSuccess: (updated) => {
      // Patch the detail cache immediately — no need to wait on a refetch
      // for a change we already know the exact result of.
      queryClient.setQueryData(machineKeys.detail(updated.id), (old: any) =>
        old ? { ...old, machine: updated } : old,
      );
      queryClient.invalidateQueries({ queryKey: machineKeys.lists() });
      toast.success(
        updated.assigned_engineer_id
          ? "Engineer assigned"
          : "Engineer unassigned",
      );
    },
    onError: () => {
      toast.error("Could not assign engineer");
    },
  });
}
