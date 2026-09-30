import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/client";
import { teamMembersApi } from "./team-members";
vi.mock("@/lib/api/client", () => ({ apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
describe("teamMembersApi", () => {
  beforeEach(() => vi.clearAllMocks());
  it("unwraps list responses and uses documented CRUD paths", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] });
    await expect(teamMembersApi.list()).resolves.toEqual([]);
    await teamMembersApi.get("member/id"); expect(apiClient.get).toHaveBeenLastCalledWith("/our-team/member%2Fid");
    await teamMembersApi.update("id", { role: "Director" }); expect(apiClient.patch).toHaveBeenCalledWith("/our-team/id", { json: { role: "Director" } });
    await teamMembersApi.delete("id"); expect(apiClient.delete).toHaveBeenCalledWith("/our-team/id");
  });
  it("uses multipart photo endpoints", async () => {
    const file = new File(["image"], "photo.webp", { type: "image/webp" }); await teamMembersApi.uploadPhoto("id", file);
    const body = vi.mocked(apiClient.put).mock.calls[0]?.[1]?.body as FormData;
    expect(apiClient.put).toHaveBeenCalledWith("/our-team/id/photo", expect.any(Object)); expect(body.get("file")).toBe(file);
    await teamMembersApi.deletePhoto("id"); expect(apiClient.delete).toHaveBeenCalledWith("/our-team/id/photo");
  });
});
