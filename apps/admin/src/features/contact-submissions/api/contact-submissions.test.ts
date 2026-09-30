import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/client";
import { contactSubmissionsApi } from "./contact-submissions";

vi.mock("@/lib/api/client", () => ({
  apiClient: { delete: vi.fn(), get: vi.fn() },
}));

describe("contactSubmissionsApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the protected list, detail, and delete endpoints", async () => {
    await contactSubmissionsApi.list();
    expect(apiClient.get).toHaveBeenCalledWith("/admin/contact-submissions");

    await contactSubmissionsApi.get("submission/id");
    expect(apiClient.get).toHaveBeenLastCalledWith(
      "/admin/contact-submissions/submission%2Fid",
    );

    await contactSubmissionsApi.delete("submission/id");
    expect(apiClient.delete).toHaveBeenCalledWith(
      "/admin/contact-submissions/submission%2Fid",
    );
  });
});
