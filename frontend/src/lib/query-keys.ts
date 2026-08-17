// Centralized query key factories — every hook references these instead of
// hardcoding array literals, so invalidation always targets the right keys
// even as more machine-related queries get added later.
export const machineKeys = {
  all: ["machines"] as const,
  lists: () => [...machineKeys.all, "list"] as const,
  detail: (id: string) => [...machineKeys.all, "detail", id] as const,
};

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
};
