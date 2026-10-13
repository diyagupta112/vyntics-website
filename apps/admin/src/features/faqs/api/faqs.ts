import { apiClient } from "@/lib/api/client";
import type { FAQ, FAQCreate, FAQUpdate } from "../types";

const faqPath = (id: string) => `/faqs/${encodeURIComponent(id)}`;
export const faqsApi = {
  list(page?: string, signal?: AbortSignal) {
    const query = page ? `?${new URLSearchParams({ page })}` : "";
    return apiClient.get<FAQ[]>(`/admin/faqs${query}`, { signal });
  },
  get(id: string) { return apiClient.get<FAQ>(`/admin/faqs/${encodeURIComponent(id)}`); },
  create(payload: FAQCreate) { return apiClient.post<FAQ>("/faqs", { json: payload }); },
  update(id: string, payload: FAQUpdate) { return apiClient.patch<FAQ>(faqPath(id), { json: payload }); },
  delete(id: string) { return apiClient.delete(faqPath(id)); },
};
