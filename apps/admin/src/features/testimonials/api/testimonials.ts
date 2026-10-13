import { apiClient } from "@/lib/api/client";
import type { Testimonial, TestimonialCreate, TestimonialUpdate } from "../types";

const testimonialPath = (id: string) => `/testimonials/${encodeURIComponent(id)}`;
export const testimonialsApi = {
  list(signal?: AbortSignal) { return apiClient.get<Testimonial[]>("/admin/testimonials", { signal }); },
  get(id: string) { return apiClient.get<Testimonial>(`/admin/testimonials/${encodeURIComponent(id)}`); },
  create(payload: TestimonialCreate) { return apiClient.post<Testimonial>("/testimonials", { json: payload }); },
  update(id: string, payload: TestimonialUpdate) { return apiClient.patch<Testimonial>(testimonialPath(id), { json: payload }); },
  delete(id: string) { return apiClient.delete(testimonialPath(id)); },
};
