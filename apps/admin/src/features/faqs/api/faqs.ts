import { apiClient } from "@/lib/api/client";
import type { FAQ, FAQCreate, FAQUpdate } from "../types";

const faqPath = (id: string) => `/faqs/${encodeURIComponent(id)}`;
export const faqsApi = {
  list(page?: string, signal?: AbortSignal, subPage?: string) {
    // sub_page is only meaningful within a page, so it is never sent alone.
    const params = new URLSearchParams(page ? { page } : {});
    if (page && subPage) params.set("sub_page", subPage);
    const query = params.size ? `?${params}` : "";
    return apiClient.get<FAQ[]>(`/admin/faqs${query}`, { signal });
  },
  get(id: string) { return apiClient.get<FAQ>(`/admin/faqs/${encodeURIComponent(id)}`); },
  create(payload: FAQCreate) { return apiClient.post<FAQ>("/faqs", { json: payload }); },
  update(id: string, payload: FAQUpdate) { return apiClient.patch<FAQ>(faqPath(id), { json: payload }); },
  delete(id: string) { return apiClient.delete(faqPath(id)); },
};
