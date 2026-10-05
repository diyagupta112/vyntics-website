import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { badgesApi } from "../api/badges";
import { badgeFixture } from "../test-fixtures";
import { BadgeList } from "./badge-list";

vi.mock("next/image", () => ({ default: "img" }));
vi.mock("../api/badges", () => ({ badgesApi: { list: vi.fn(), delete: vi.fn() } }));

describe("BadgeList", () => {
  beforeEach(() => vi.clearAllMocks());
  it("renders loading and compact active/inactive Badge cards", async () => {
    vi.mocked(badgesApi.list).mockResolvedValue([badgeFixture, { ...badgeFixture, id: "badge-2", name: "ISO 27001", logo_url: null, website_url: null, description: null, is_active: false, display_order: 5 }]);
    render(<BadgeList />);
    expect(screen.getByRole("status", { name: "Loading Badges" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Databricks Partner" })).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getByText("Display order 2")).toBeInTheDocument();
    expect(screen.getByText("Website not provided")).toBeInTheDocument();
  });
  it("renders the empty state", async () => {
    vi.mocked(badgesApi.list).mockResolvedValue([]);
    render(<BadgeList />);
    expect(await screen.findByText("No badges yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create New Badge" })).toHaveAttribute("href", "/badges/new");
  });
  it("renders a safe retryable error", async () => {
    vi.mocked(badgesApi.list).mockRejectedValueOnce(new ApiError({ kind: "network", message: "secret" })).mockResolvedValueOnce([badgeFixture]);
    render(<BadgeList />);
    expect(await screen.findByText("Unable to load badges.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    expect(await screen.findByText("Databricks Partner")).toBeInTheDocument();
  });
  it("keeps website and delete actions separate from card navigation", async () => {
    vi.mocked(badgesApi.list).mockResolvedValue([badgeFixture]);
    vi.mocked(badgesApi.delete).mockResolvedValue(undefined);
    render(<BadgeList />);
    const website = await screen.findByRole("link", { name: /Visit website/ });
    expect(website).toHaveAttribute("href", badgeFixture.website_url);
    expect(website).toHaveAttribute("target", "_blank");
    expect(website.closest("a")).not.toHaveAttribute("href", `/badges/${badgeFixture.id}/edit`);
    fireEvent.click(screen.getByRole("button", { name: `Delete ${badgeFixture.name}` }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("managed logo");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(badgesApi.delete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: `Delete ${badgeFixture.name}` }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Permanently" }));
    await waitFor(() => expect(badgesApi.delete).toHaveBeenCalledWith(badgeFixture.id));
    await waitFor(() => expect(screen.queryByText(badgeFixture.name)).not.toBeInTheDocument());
  });
});
