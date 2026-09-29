import { apiClient } from "@/lib/api/client";

import type {
  CaseStudy,
  CaseStudyCreateRequest,
  CaseStudyUpdateRequest,
} from "../types";

const resourcePath = (caseStudyId: string) =>
  `/case-studies/${encodeURIComponent(caseStudyId)}`;

export const caseStudiesApi = {
  list() {
    return apiClient.get<CaseStudy[]>("/admin/case-studies");
  },
  get(caseStudyId: string) {
    return apiClient.get<CaseStudy>(
      `/admin/case-studies/${encodeURIComponent(caseStudyId)}`,
    );
  },
  create(payload: CaseStudyCreateRequest) {
    return apiClient.post<CaseStudy>("/case-studies", { json: payload });
  },
  update(caseStudyId: string, payload: CaseStudyUpdateRequest) {
    return apiClient.patch<CaseStudy>(resourcePath(caseStudyId), {
      json: payload,
    });
  },
  delete(caseStudyId: string) {
    return apiClient.delete(resourcePath(caseStudyId));
  },
  uploadCover(caseStudyId: string, file: File) {
    const body = new FormData();
    body.set("file", file);
    return apiClient.put<CaseStudy>(
      `${resourcePath(caseStudyId)}/cover-image`,
      { body },
    );
  },
  deleteCover(caseStudyId: string) {
    return apiClient.delete(`${resourcePath(caseStudyId)}/cover-image`);
  },
};
