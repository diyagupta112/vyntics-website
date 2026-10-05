import { apiClient } from "@/lib/api/client";
import type { AdminRole } from "@/features/auth/types";

export type AdminUserListItem = {
  id: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
};

export const adminUsersApi = {
  list(signal?: AbortSignal) {
    return apiClient.get<AdminUserListItem[]>("/admin/users", { signal });
  },
};
