import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { LoginForm } from "./login-form";

const mocks = vi.hoisted(() => ({
  checkAdminAccess: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  signInWithOAuth: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      signInWithOAuth: mocks.signInWithOAuth,
      signInWithPassword: mocks.signInWithPassword,
      signOut: mocks.signOut,
    },
  }),
}));

vi.mock("@/features/auth/lib/admin-access", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/auth/lib/admin-access")>();
  return { ...actual, checkAdminAccess: mocks.checkAdminAccess };
});

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders labeled credential fields", () => {
    render(<LoginForm />);

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/Password/)).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByText(/sign up|create account|register/i)).not.toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    render(<LoginForm />);
    const password = screen.getByLabelText(/Password/);

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();
  });

  it("validates required credentials without calling Supabase", async () => {
    render(<LoginForm />);

    fireEvent.submit(screen.getByRole("button", { name: "Sign in" }).closest("form")!);

    expect(await screen.findByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("signs in, verifies backend access, and enters the dashboard", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: "test-token" } },
      error: null,
    });
    mocks.checkAdminAccess.mockResolvedValue({ allowed: true });
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "admin@vyntics.com" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "correct-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard"));
    expect(mocks.signInWithPassword).toHaveBeenCalledOnce();
    expect(mocks.checkAdminAccess).toHaveBeenCalledWith("test-token");
  });

  it("shows a safe error when credentials fail", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: new Error("provider"),
    });
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "admin@vyntics.com" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "wrong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to sign in. Please check your email and password.",
    );
  });

  it("prevents duplicate submissions while sign-in is pending", async () => {
    let finishSignIn: ((value: unknown) => void) | undefined;
    mocks.signInWithPassword.mockReturnValue(new Promise((resolve) => (finishSignIn = resolve)));
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "admin@vyntics.com" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "password" } });
    const form = screen.getByRole("button", { name: "Sign in" }).closest("form")!;
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(mocks.signInWithPassword).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Signing in…" })).toBeDisabled();
    finishSignIn?.({ data: { session: null }, error: new Error("failed") });
    await screen.findByRole("alert");
  });

  it("starts Google OAuth with the callback and dashboard redirect", async () => {
    mocks.signInWithOAuth.mockResolvedValue({ error: null });
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));

    await waitFor(() => expect(mocks.signInWithOAuth).toHaveBeenCalledOnce());
    expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "http://localhost:3000/auth/callback?next=%2Fdashboard" },
    });
  });
});
