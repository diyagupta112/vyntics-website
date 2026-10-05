import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/client";
import { jobApplicationsApi } from "./job-applications";

vi.mock("@/lib/api/client", () => ({
  apiClient: { download: vi.fn(), get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe("jobApplicationsApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("exports all applicants or the selected career through the binary client", async () => {
    await jobApplicationsApi.export();
    expect(apiClient.download).toHaveBeenCalledWith("/admin/job-applications/export");
    await jobApplicationsApi.export("career/id");
    expect(apiClient.download).toHaveBeenLastCalledWith("/admin/job-applications/export?career_id=career%2Fid");
  });

  it("uses the documented global and Career-specific reads", async () => {
    await jobApplicationsApi.listAll();
    expect(apiClient.get).toHaveBeenCalledWith("/admin/job-applications");
    await jobApplicationsApi.listForCareer("career/id");
    expect(apiClient.get).toHaveBeenLastCalledWith(
      "/admin/careers/career%2Fid/applications",
    );
    await jobApplicationsApi.get("application/id");
    expect(apiClient.get).toHaveBeenLastCalledWith(
      "/admin/job-applications/application%2Fid",
    );
  });

  it("limits updates to the supplied administrative payload", async () => {
    await jobApplicationsApi.update("application-1", {
      status: "reviewing",
      notes: null,
    });
    expect(apiClient.patch).toHaveBeenCalledWith(
      "/admin/job-applications/application-1",
      { json: { status: "reviewing", notes: null } },
    );
    await jobApplicationsApi.delete("application-1");
    expect(apiClient.delete).toHaveBeenCalledWith(
      "/admin/job-applications/application-1",
    );
  });
});
