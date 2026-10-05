import { apiClient } from "@/lib/api/client";
import type { Badge, BadgeCreateRequest, BadgeUpdateRequest } from "../types";

const badgePath = (id: string) => `/badges/${encodeURIComponent(id)}`;

export const badgesApi = {
  list() { return apiClient.get<Badge[]>("/admin/badges"); },
  get(id: string) { return apiClient.get<Badge>(`/admin/badges/${encodeURIComponent(id)}`); },
  create(payload: BadgeCreateRequest) { return apiClient.post<Badge>("/badges", { json: payload }); },
  update(id: string, payload: BadgeUpdateRequest) { return apiClient.patch<Badge>(badgePath(id), { json: payload }); },
  delete(id: string) { return apiClient.delete(badgePath(id)); },
  uploadLogo(id: string, file: File) {
    const body = new FormData();
    body.set("file", file);
    return apiClient.put<Badge>(`${badgePath(id)}/logo`, { body });
  },
  deleteLogo(id: string) { return apiClient.delete(`${badgePath(id)}/logo`); },
};
