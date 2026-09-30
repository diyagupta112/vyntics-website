import { apiClient } from "@/lib/api/client";

import type {
  Career,
  CareerCreateRequest,
  CareerListItem,
  CareerListResponse,
  CareerUpdateRequest,
} from "../types";

export const careersApi = {
  async list(): Promise<CareerListItem[]> {
    const response = await apiClient.get<CareerListResponse>("/careers");
    return response.data;
  },
  getBySlug(slug: string) {
    return apiClient.get<Career>(`/careers/${encodeURIComponent(slug)}`);
  },
  create(payload: CareerCreateRequest) {
    return apiClient.post<Career>("/careers", { json: payload });
  },
  update(careerId: string, payload: CareerUpdateRequest) {
    return apiClient.patch<Career>(
      `/careers/${encodeURIComponent(careerId)}`,
      { json: payload },
    );
  },
  delete(careerId: string) {
    return apiClient.delete(`/careers/${encodeURIComponent(careerId)}`);
  },
};
