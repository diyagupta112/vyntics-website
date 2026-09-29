import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { Sidebar } from "./sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("Sidebar", () => {
  it("renders the approved navigation and marks the current page", () => {
    render(<Sidebar />);

    expect(screen.getByRole("navigation", { name: "Admin navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Blogs" })).toHaveAttribute(
      "href",
      "/blogs",
    );
    expect(screen.getByRole("link", { name: "Case Studies" })).toHaveAttribute(
      "href",
      "/case-studies",
    );
    expect(screen.getByRole("link", { name: "Careers" })).toHaveAttribute(
      "href",
      "/careers",
    );

    for (const label of [
      "Job Applications",
      "Team Members",
      "Contact Submissions",
    ]) {
      expect(screen.getByText(label)).toHaveAttribute("aria-disabled", "true");
    }
  });
});
