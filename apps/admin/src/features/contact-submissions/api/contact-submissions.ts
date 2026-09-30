import { apiClient } from "@/lib/api/client";
import type { ContactSubmission } from "../types";

const submissionPath = (submissionId: string) =>
  `/admin/contact-submissions/${encodeURIComponent(submissionId)}`;

export const contactSubmissionsApi = {
  list() {
    return apiClient.get<ContactSubmission[]>("/admin/contact-submissions");
  },
  get(submissionId: string) {
    return apiClient.get<ContactSubmission>(submissionPath(submissionId));
  },
  delete(submissionId: string) {
    return apiClient.delete(submissionPath(submissionId));
  },
};
