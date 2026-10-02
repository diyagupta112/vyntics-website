import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCurrentAdmin } from "@/features/auth/lib/current-admin";
import type { CurrentAdmin } from "@/features/auth/types";
import { SettingsPage } from "./settings-page";

const replace = vi.fn();
const refresh = vi.fn();
const signOut = vi.fn().mockResolvedValue({ error: null });

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({ auth: { signOut } }),
}));
vi.mock("@/features/auth/lib/current-admin", () => ({
  useCurrentAdmin: vi.fn(),
}));

const admin: CurrentAdmin = {
  id: "internal-admin-id",
  auth_user_id: "internal-auth-id",
  email: "settings-user@vyntics.com",
  role: "superadmin",
  is_active: true,
  created_at: "2025-01-15T00:00:00Z",
  updated_at: "2026-09-20T00:00:00Z",
};

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCurrentAdmin).mockReturnValue({
      admin,
      error: undefined,
      loading: false,
      retry: vi.fn(),
    });
  });

  it("renders real current-admin profile, role, status, and application sections", () => {
    render(<SettingsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeInTheDocument();
    expect(screen.getByText("settings-user@vyntics.com")).toBeInTheDocument();
    expect(screen.getAllByText("Super Admin")).toHaveLength(2);
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Vyntics Admin Panel")).toBeInTheDocument();
    expect(screen.queryByText("internal-admin-id")).not.toBeInTheDocument();
    expect(screen.queryByText("internal-auth-id")).not.toBeInTheDocument();
  });

  it("renders the backend-provided inactive normal-admin state", () => {
    vi.mocked(useCurrentAdmin).mockReturnValue({
      admin: { ...admin, role: "admin", is_active: false },
      error: undefined,
      loading: false,
      retry: vi.fn(),
    });

    render(<SettingsPage />);

    expect(screen.getAllByText("Admin")).toHaveLength(2);
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("shows a stable loading state without account placeholders", () => {
    vi.mocked(useCurrentAdmin).mockReturnValue({
      admin: undefined,
      error: undefined,
      loading: true,
      retry: vi.fn(),
    });

    render(<SettingsPage />);

    expect(screen.getByRole("status", { name: "Loading account settings" })).toBeInTheDocument();
    expect(screen.queryByText("settings-user@vyntics.com")).not.toBeInTheDocument();
  });

  it("shows a safe error and retries through the shared current-admin state", () => {
    const retry = vi.fn();
    vi.mocked(useCurrentAdmin).mockReturnValue({
      admin: undefined,
      error: "Unable to load your account information. Please try again.",
      loading: false,
      retry,
    });

    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));

    expect(retry).toHaveBeenCalledOnce();
    expect(screen.queryByText(/private detail/i)).not.toBeInTheDocument();
  });

  it("signs out through the existing Supabase logout flow", async () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));

    await waitFor(() => expect(signOut).toHaveBeenCalledOnce());
    expect(replace).toHaveBeenCalledWith("/login");
    expect(refresh).toHaveBeenCalledOnce();
  });
});
