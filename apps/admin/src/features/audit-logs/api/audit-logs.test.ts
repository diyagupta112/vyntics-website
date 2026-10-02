import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { auditLogsApi, buildAuditLogListPath } from "./audit-logs";

vi.mock("@/lib/api/client", () => ({
  apiClient: { get: vi.fn() },
}));

describe("auditLogsApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("builds encoded backend pagination and filter queries", () => {
    const path = buildAuditLogListPath({
      action: "update",
      actorId: "actor/id",
      from: "2026-10-01T00:00:00+05:30",
      page: 2,
      pageSize: 50,
      resourceId: "resource id",
      resourceType: "case_study",
      to: "2026-10-02T00:00:00Z",
    });
    const url = new URL(path, "https://admin.test");

    expect(url.pathname).toBe("/admin/audit-logs");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      page: "2",
      page_size: "50",
      actor_id: "actor/id",
      action: "update",
      resource_type: "case_study",
      resource_id: "resource id",
      from: "2026-10-01T00:00:00+05:30",
      to: "2026-10-02T00:00:00Z",
    });
  });

  it("uses the shared client for list and encoded detail reads", async () => {
    await auditLogsApi.list({ page: 3, pageSize: 25 });
    expect(apiClient.get).toHaveBeenCalledWith(
      "/admin/audit-logs?page=3&page_size=25",
      { signal: undefined },
    );

    await auditLogsApi.get("audit/id");
    expect(apiClient.get).toHaveBeenLastCalledWith(
      "/admin/audit-logs/audit%2Fid",
      { signal: undefined },
    );
  });

  it("treats only a successful protected request as audit access", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({});
    await expect(auditLogsApi.checkAccess()).resolves.toBe(true);

    vi.mocked(apiClient.get).mockRejectedValueOnce(
      new ApiError({ kind: "permission", message: "private provider detail" }),
    );
    await expect(auditLogsApi.checkAccess()).resolves.toBe(false);
  });
});
