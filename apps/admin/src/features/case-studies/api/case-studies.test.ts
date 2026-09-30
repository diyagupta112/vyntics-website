import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/client";
import { caseStudiesApi } from "./case-studies";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("caseStudiesApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses administrative reads and documented mutation paths", async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await caseStudiesApi.list();
    expect(apiClient.get).toHaveBeenCalledWith("/admin/case-studies");

    await caseStudiesApi.get("id");
    expect(apiClient.get).toHaveBeenLastCalledWith("/admin/case-studies/id");

    await caseStudiesApi.update("id", { title: "Changed" });
    expect(apiClient.patch).toHaveBeenCalledWith("/case-studies/id", {
      json: { title: "Changed" },
    });

    await caseStudiesApi.delete("id");
    expect(apiClient.delete).toHaveBeenCalledWith("/case-studies/id");
  });

  it("uploads a cover using multipart field file", async () => {
    const file = new File(["image"], "cover.webp", { type: "image/webp" });
    await caseStudiesApi.uploadCover("id", file);

    const options = vi.mocked(apiClient.put).mock.calls[0]?.[1];
    expect(apiClient.put).toHaveBeenCalledWith(
      "/case-studies/id/cover-image",
      expect.any(Object),
    );
    expect(options?.body).toBeInstanceOf(FormData);
    expect((options?.body as FormData).get("file")).toBe(file);
  });
});
