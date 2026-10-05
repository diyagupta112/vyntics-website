import { apiClient } from "@/lib/api/client";
import type {
  JobApplicationDetail,
  JobApplicationListItem,
  JobApplicationUpdateRequest,
} from "../types";

const applicationPath = (applicationId: string) =>
  `/admin/job-applications/${encodeURIComponent(applicationId)}`;

export const jobApplicationsApi = {
  export(careerId?: string) {
    const query = careerId ? `?${new URLSearchParams({ career_id: careerId })}` : "";
    return apiClient.download(`/admin/job-applications/export${query}`);
  },
  listAll() {
    return apiClient.get<JobApplicationListItem[]>("/admin/job-applications");
  },
  listForCareer(careerId: string) {
    return apiClient.get<JobApplicationListItem[]>(
      `/admin/careers/${encodeURIComponent(careerId)}/applications`,
    );
  },
  get(applicationId: string) {
    return apiClient.get<JobApplicationDetail>(applicationPath(applicationId));
  },
  update(applicationId: string, payload: JobApplicationUpdateRequest) {
    return apiClient.patch<JobApplicationDetail>(
      applicationPath(applicationId),
      { json: payload },
    );
  },
  delete(applicationId: string) {
    return apiClient.delete(applicationPath(applicationId));
  },
};
