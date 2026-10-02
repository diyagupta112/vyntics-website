import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { currentAdminApi } from "../api/current-admin";
import type { CurrentAdmin } from "../types";
import { CurrentAdminProvider, useCurrentAdmin } from "./current-admin";

vi.mock("../api/current-admin", () => ({
  currentAdminApi: { get: vi.fn() },
}));

const admin: CurrentAdmin = {
  id: "admin-id",
  auth_user_id: "auth-id",
  email: "owner@vyntics.com",
  role: "superadmin",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-02-01T00:00:00Z",
};

const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
  <CurrentAdminProvider>{children}</CurrentAdminProvider>
);

describe("CurrentAdminProvider", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads the current admin once and shares the result", async () => {
    vi.mocked(currentAdminApi.get).mockResolvedValue(admin);

    const { result } = renderHook(() => useCurrentAdmin(), { wrapper });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.admin).toEqual(admin));
    expect(result.current.loading).toBe(false);
    expect(currentAdminApi.get).toHaveBeenCalledOnce();
  });

  it("exposes a safe error and retries the request", async () => {
    vi.mocked(currentAdminApi.get)
      .mockRejectedValueOnce(new Error("private detail"))
      .mockResolvedValueOnce(admin);

    const { result } = renderHook(() => useCurrentAdmin(), { wrapper });

    await waitFor(() => expect(result.current.error).toMatch(/unable to load/i));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.admin).toEqual(admin));
    expect(currentAdminApi.get).toHaveBeenCalledTimes(2);
  });
});
