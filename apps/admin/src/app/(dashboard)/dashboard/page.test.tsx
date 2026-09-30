import { render, screen } from "@testing-library/react";

import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("renders an honest dashboard foundation without fake metrics", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-overview-grid")).toBeInTheDocument();
    expect(
      screen.getByText("No metrics are shown until supported data sources are connected."),
    ).toBeInTheDocument();
  });
});
