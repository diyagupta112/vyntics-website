import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/client";
import { blogsApi } from "./blogs";

vi.mock("@/lib/api/client", () => ({ apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

describe("blogsApi", () => {
  beforeEach(() => vi.clearAllMocks());
  it("uses the protected administrative reads and Blog mutation paths", async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await blogsApi.list();
    expect(apiClient.get).toHaveBeenCalledWith("/admin/blogs");
    await blogsApi.get("id");
    expect(apiClient.get).toHaveBeenLastCalledWith("/admin/blogs/id");
    await blogsApi.update("id", { title: "Changed" });
    expect(apiClient.patch).toHaveBeenCalledWith("/blogs/id", { json: { title: "Changed" } });
    await blogsApi.delete("id");
    expect(apiClient.delete).toHaveBeenCalledWith("/blogs/id");
  });
  it("uploads a cover as multipart field file", async () => {
    const file = new File(["image"], "cover.jpg", { type: "image/jpeg" });
    await blogsApi.uploadCover("id", file);
    const options = vi.mocked(apiClient.put).mock.calls[0]?.[1];
    expect(apiClient.put).toHaveBeenCalledWith("/blogs/id/cover-image", expect.any(Object));
    expect(options?.body).toBeInstanceOf(FormData);
    expect((options?.body as FormData).get("file")).toBe(file);
  });
});
