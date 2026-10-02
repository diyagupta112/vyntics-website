import { apiClient } from "@/lib/api/client";
import type { CurrentAdmin } from "../types";

export const currentAdminApi = {
  get(signal?: AbortSignal) {
    return apiClient.get<CurrentAdmin>("/admin/me", { signal });
  },
};
