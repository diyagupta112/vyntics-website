import { apiClient } from "@/lib/api/client";

import type { Blog, BlogCreateRequest, BlogUpdateRequest } from "../types";

const resourcePath = (blogId: string) => `/blogs/${encodeURIComponent(blogId)}`;

export const blogsApi = {
  list() {
    return apiClient.get<Blog[]>("/admin/blogs");
  },
  get(blogId: string) {
    return apiClient.get<Blog>(`/admin/blogs/${encodeURIComponent(blogId)}`);
  },
  create(payload: BlogCreateRequest) {
    return apiClient.post<Blog>("/blogs", { json: payload });
  },
  update(blogId: string, payload: BlogUpdateRequest) {
    return apiClient.patch<Blog>(resourcePath(blogId), { json: payload });
  },
  delete(blogId: string) {
    return apiClient.delete(resourcePath(blogId));
  },
  uploadCover(blogId: string, file: File) {
    const body = new FormData();
    body.set("file", file);
    return apiClient.put<Blog>(`${resourcePath(blogId)}/cover-image`, { body });
  },
  deleteCover(blogId: string) {
    return apiClient.delete(`${resourcePath(blogId)}/cover-image`);
  },
};
