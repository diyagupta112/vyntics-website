import { vi } from "vitest";

import { checkAdminAccess, getAdminAccessMessage } from "./admin-access";

vi.mock("@/lib/config/public-env", () => ({
  getPublicEnvironment: () => ({
    apiBaseUrl: "https://api.example.test",
    supabaseAnonKey: "public-key",
    supabaseUrl: "https://project.example.test",
  }),
}));

describe("checkAdminAccess", () => {
  it("sends the access token to a real protected backend contract", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("[]", { status: 200 }));

    await expect(checkAdminAccess("access-token", fetcher)).resolves.toEqual({ allowed: true });
    expect(fetcher).toHaveBeenCalledWith("https://api.example.test/admin/blogs", {
      headers: { Authorization: "Bearer access-token" },
      cache: "no-store",
    });
  });

  it.each([
    [401, "authentication"],
    [403, "permission"],
    [503, "service"],
  ] as const)("maps backend status %s safely", async (status, reason) => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status }));
    await expect(checkAdminAccess("token", fetcher)).resolves.toEqual({ allowed: false, reason });
  });

  it("maps network failures to service availability", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("internal connection detail"));
    await expect(checkAdminAccess("token", fetcher)).resolves.toEqual({
      allowed: false,
      reason: "service",
    });
  });

  it("provides safe user-facing authorization messages", () => {
    expect(getAdminAccessMessage("authentication")).toMatch(/not authorized/i);
    expect(getAdminAccessMessage("permission")).toMatch(/permission/i);
    expect(getAdminAccessMessage("service")).toMatch(/temporarily unavailable/i);
  });
});
