import { vi } from "vitest";

import { requireAdminAccess } from "./protected-route";

const mocks = vi.hoisted(() => ({
  checkAdminAccess: vi.fn(),
  getSession: vi.fn(),
  getUser: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: { getSession: mocks.getSession, getUser: mocks.getUser },
  }),
}));
vi.mock("./admin-access", () => ({ checkAdminAccess: mocks.checkAdminAccess }));

describe("requireAdminAccess", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects an unauthenticated protected request to login", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    await expect(requireAdminAccess()).rejects.toThrow("REDIRECT:/login");
  });

  it("allows an authenticated, backend-authorized admin", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { email: "admin@vyntics.com", id: "user-id" } },
    });
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: "access-token" } },
    });
    mocks.checkAdminAccess.mockResolvedValue({ allowed: true });

    await expect(requireAdminAccess()).resolves.toEqual({
      email: "admin@vyntics.com",
      userId: "user-id",
    });
  });

  it("routes insufficient permissions to the permission state", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-id" } } });
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: "access-token" } },
    });
    mocks.checkAdminAccess.mockResolvedValue({ allowed: false, reason: "permission" });

    await expect(requireAdminAccess()).rejects.toThrow(
      "REDIRECT:/access-denied?reason=permission",
    );
  });
});
