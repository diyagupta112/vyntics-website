import { apiClient } from "@/lib/api/client";
import type { TeamListResponse, TeamMember, TeamMemberCreateRequest, TeamMemberUpdateRequest } from "../types";

const path = (id: string) => `/our-team/${encodeURIComponent(id)}`;

export const teamMembersApi = {
  async list(): Promise<TeamMember[]> {
    return (await apiClient.get<TeamListResponse>("/our-team")).data;
  },
  get(id: string) { return apiClient.get<TeamMember>(path(id)); },
  create(payload: TeamMemberCreateRequest) { return apiClient.post<TeamMember>("/our-team", { json: payload }); },
  update(id: string, payload: TeamMemberUpdateRequest) { return apiClient.patch<TeamMember>(path(id), { json: payload }); },
  delete(id: string) { return apiClient.delete(path(id)); },
  uploadPhoto(id: string, file: File) {
    const body = new FormData();
    body.set("file", file);
    return apiClient.put<TeamMember>(`${path(id)}/photo`, { body });
  },
  deletePhoto(id: string) { return apiClient.delete(`${path(id)}/photo`); },
};
