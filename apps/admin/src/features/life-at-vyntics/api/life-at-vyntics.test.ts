import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/client";
import { lifeAtVynticsApi } from "./life-at-vyntics";

vi.mock("@/lib/api/client", () => ({ apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

describe("lifeAtVynticsApi", () => {
  beforeEach(() => vi.clearAllMocks());
  it("uses the backend endpoints", async () => {
    await lifeAtVynticsApi.list(); expect(apiClient.get).toHaveBeenLastCalledWith("/admin/life-at-vyntics");
    await lifeAtVynticsApi.get("a/b"); expect(apiClient.get).toHaveBeenLastCalledWith("/admin/life-at-vyntics/a%2Fb");
    await lifeAtVynticsApi.create({ display_order: 3 }); expect(apiClient.post).toHaveBeenCalledWith("/life-at-vyntics", { json: { display_order: 3 } });
    await lifeAtVynticsApi.create({}); expect(apiClient.post).toHaveBeenLastCalledWith("/life-at-vyntics", { json: {} });
    await lifeAtVynticsApi.update("x", { display_order: 2 }); expect(apiClient.patch).toHaveBeenCalledWith("/life-at-vyntics/x", { json: { display_order: 2 } });
    await lifeAtVynticsApi.delete("x"); expect(apiClient.delete).toHaveBeenLastCalledWith("/life-at-vyntics/x");
    await lifeAtVynticsApi.deleteImage("x"); expect(apiClient.delete).toHaveBeenLastCalledWith("/life-at-vyntics/x/image");
  });
  it("uploads the image as multipart field file", async () => {
    const file = new File(["image"], "a.webp", { type: "image/webp" });
    await lifeAtVynticsApi.uploadImage("x", file);
    const options = vi.mocked(apiClient.put).mock.calls[0]?.[1];
    expect(apiClient.put).toHaveBeenCalledWith("/life-at-vyntics/x/image", expect.any(Object));
    expect((options?.body as FormData).get("file")).toBe(file);
  });
});
