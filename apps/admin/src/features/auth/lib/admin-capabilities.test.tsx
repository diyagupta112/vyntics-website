import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCurrentAdmin } from "./current-admin";
import { useAdminCapabilities } from "./admin-capabilities";

vi.mock("./current-admin", () => ({ useCurrentAdmin: vi.fn() }));

describe("useAdminCapabilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCurrentAdmin).mockReturnValue({
      admin: undefined,
      error: undefined,
      loading: true,
      retry: vi.fn(),
    });
  });

  it("denies Audit Logs visibility while current-admin data is unavailable", () => {
    const { result } = renderHook(() => useAdminCapabilities());
    expect(result.current.canReadAuditLogs).toBe(false);
  });

  it.each([
    ["superadmin", true],
    ["admin", false],
  ] as const)("maps the authoritative %s role to Audit Logs visibility", (role, expected) => {
    vi.mocked(useCurrentAdmin).mockReturnValue({
      admin: {
        id: "admin-id",
        auth_user_id: "auth-id",
        email: "admin@example.com",
        role,
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-02T00:00:00Z",
      },
      error: undefined,
      loading: false,
      retry: vi.fn(),
    });

    const { result } = renderHook(() => useAdminCapabilities());
    expect(result.current.canReadAuditLogs).toBe(expected);
  });
});
