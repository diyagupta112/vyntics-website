import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/client";
import { careersApi } from "./careers";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("careersApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unwraps the public Career list envelope", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [{ id: "career-1" }] });

    await expect(careersApi.list()).resolves.toEqual([{ id: "career-1" }]);
    expect(apiClient.get).toHaveBeenCalledWith("/careers");
  });

  it("uses the slug for detail and the id for protected mutations", async () => {
    await careersApi.getBySlug("senior engineer");
    expect(apiClient.get).toHaveBeenCalledWith("/careers/senior%20engineer");

    await careersApi.create({ title: "Engineer" } as never);
    expect(apiClient.post).toHaveBeenCalledWith("/careers", {
      json: { title: "Engineer" },
    });

    await careersApi.update("career/id", { title: "Lead Engineer" });
    expect(apiClient.patch).toHaveBeenCalledWith("/careers/career%2Fid", {
      json: { title: "Lead Engineer" },
    });

    await careersApi.delete("career/id");
    expect(apiClient.delete).toHaveBeenCalledWith("/careers/career%2Fid");
  });
});
