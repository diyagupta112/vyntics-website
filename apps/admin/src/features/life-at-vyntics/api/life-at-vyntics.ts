import { apiClient } from "@/lib/api/client";
import type { LifeAtVyntics, LifeAtVynticsCreateRequest, LifeAtVynticsUpdateRequest } from "../types";

const itemPath = (id: string) => `/life-at-vyntics/${encodeURIComponent(id)}`;

export const lifeAtVynticsApi = {
  list() { return apiClient.get<LifeAtVyntics[]>("/admin/life-at-vyntics"); },
  get(id: string) { return apiClient.get<LifeAtVyntics>(`/admin/life-at-vyntics/${encodeURIComponent(id)}`); },
  create(payload: LifeAtVynticsCreateRequest) { return apiClient.post<LifeAtVyntics>("/life-at-vyntics", { json: payload }); },
  update(id: string, payload: LifeAtVynticsUpdateRequest) { return apiClient.patch<LifeAtVyntics>(itemPath(id), { json: payload }); },
  delete(id: string) { return apiClient.delete(itemPath(id)); },
  uploadImage(id: string, file: File) {
    const body = new FormData();
    body.set("file", file);
    return apiClient.put<LifeAtVyntics>(`${itemPath(id)}/image`, { body });
  },
  deleteImage(id: string) { return apiClient.delete(`${itemPath(id)}/image`); },
};
