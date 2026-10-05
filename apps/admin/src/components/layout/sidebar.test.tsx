import { render, screen, within } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

import { useAdminCapabilities } from "@/features/auth/lib/admin-capabilities";
import { Sidebar } from "./sidebar";

const navigationState = vi.hoisted(() => ({ pathname: "/dashboard" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
}));
vi.mock("@/features/auth/lib/admin-capabilities", () => ({
  useAdminCapabilities: vi.fn(),
}));

const expectedNavigation = [
  ["Dashboard", "/dashboard"],
  ["Blogs", "/blogs"],
  ["Case Studies", "/case-studies"],
  ["Badges", "/badges"],
  ["Careers", "/careers"],
  ["Job Applications", "/job-applications"],
  ["Our Team", "/team"],
  ["Contact Submissions", "/contact"],
] as const;

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigationState.pathname = "/dashboard";
    vi.mocked(useAdminCapabilities).mockReturnValue({
      canReadAuditLogs: false,
    });
  });

  it("renders the Vyntics brand and every approved primary destination", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "VYNTICS Admin Panel" })).toHaveAttribute(
      "href",
      "/dashboard",
    );

    const primaryNavigation = screen.getByRole("navigation", { name: "Admin navigation" });
    for (const [label, href] of expectedNavigation) {
      expect(within(primaryNavigation).getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href,
      );
    }

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("keeps utility actions structurally separate and orders Audit Logs above Settings", () => {
    vi.mocked(useAdminCapabilities).mockReturnValue({ canReadAuditLogs: true });

    render(<Sidebar />);

    const utilities = screen.getByRole("navigation", { name: "Admin utilities" });
    const items = within(utilities).getAllByRole("listitem");

    expect(within(items[0]).getByRole("link", { name: "Audit Logs" })).toHaveAttribute(
      "href",
      "/audit-logs",
    );
    expect(within(items[1]).getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/settings",
    );
    expect(within(screen.getByRole("navigation", { name: "Admin navigation" })).queryByText("Audit Logs"))
      .not.toBeInTheDocument();
  });

  it("marks a parent destination active on nested routes", () => {
    navigationState.pathname = "/blogs/example-post";

    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "Blogs" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("shows Audit Logs after superadmin approval and marks its nested routes active", () => {
    navigationState.pathname = "/audit-logs/example-entry";
    vi.mocked(useAdminCapabilities).mockReturnValue({ canReadAuditLogs: true });

    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "Audit Logs" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("keeps Audit Logs hidden from a normal admin while retaining Settings", () => {
    render(<Sidebar />);

    expect(screen.queryByRole("link", { name: "Audit Logs" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/settings",
    );
  });

  it("marks Settings active on its route", () => {
    navigationState.pathname = "/settings";

    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
