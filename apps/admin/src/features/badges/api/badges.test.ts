import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/client";
import { badgesApi } from "./badges";

vi.mock("@/lib/api/client", () => ({ apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

describe("badgesApi", () => {
  beforeEach(() => vi.clearAllMocks());
  it("uses administrative reads and Badge mutation endpoints", async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await badgesApi.list(); expect(apiClient.get).toHaveBeenLastCalledWith("/admin/badges");
    await badgesApi.get("badge/id"); expect(apiClient.get).toHaveBeenLastCalledWith("/admin/badges/badge%2Fid");
    await badgesApi.create({ name: "Partner", description: null, website_url: null, display_order: 0, is_active: true }); expect(apiClient.post).toHaveBeenCalledWith("/badges", { json: expect.objectContaining({ name: "Partner" }) });
    await badgesApi.update("badge-1", { is_active: false }); expect(apiClient.patch).toHaveBeenCalledWith("/badges/badge-1", { json: { is_active: false } });
    await badgesApi.delete("badge-1"); expect(apiClient.delete).toHaveBeenCalledWith("/badges/badge-1");
    await badgesApi.deleteLogo("badge-1"); expect(apiClient.delete).toHaveBeenCalledWith("/badges/badge-1/logo");
  });
  it("uploads the logo as multipart field file", async () => {
    const file = new File(["image"], "logo.webp", { type: "image/webp" });
    await badgesApi.uploadLogo("badge-1", file);
    const options = vi.mocked(apiClient.put).mock.calls[0]?.[1];
    expect(apiClient.put).toHaveBeenCalledWith("/badges/badge-1/logo", expect.any(Object));
    expect(options?.body).toBeInstanceOf(FormData);
    expect((options?.body as FormData).get("file")).toBe(file);
  });
});
