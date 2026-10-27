import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { lifeAtVynticsApi } from "../api/life-at-vyntics";
import { lifeFixture } from "../test-fixtures";
import { LifeList } from "./life-list";

vi.mock("next/image", () => ({ default: "img" }));
vi.mock("../api/life-at-vyntics", () => ({ lifeAtVynticsApi: { list: vi.fn(), delete: vi.fn() } }));

const second = { ...lifeFixture, id: "life-2", image_url: null, display_order: 3 };

describe("LifeList", () => {
  beforeEach(() => vi.clearAllMocks());
  it("renders loading, then images and positions in backend order without metadata", async () => {
    vi.mocked(lifeAtVynticsApi.list).mockResolvedValue([lifeFixture, second]);
    render(<LifeList />);
    expect(screen.getByRole("status", { name: "Loading Life at Vyntics" })).toBeInTheDocument();
    expect(await screen.findByText("Position 2")).toBeInTheDocument();
    expect(screen.getByText("Position 3")).toBeInTheDocument();
    expect(screen.getByAltText("Life at Vyntics image 2")).toHaveAttribute("src", lifeFixture.image_url);
    expect(screen.getByText("No image")).toBeInTheDocument();
    expect(screen.queryByText(/^(Active|Inactive)$/)).toBeNull();
    expect(screen.getByRole("link", { name: "+ Add Image" })).toHaveAttribute("href", "/life-at-vyntics/new");
    expect(screen.getAllByRole("link", { name: /Edit \/ Reorder/ })[0]).toHaveAttribute("href", "/life-at-vyntics/life-1/edit");
  });
  it("renders the empty state", async () => {
    vi.mocked(lifeAtVynticsApi.list).mockResolvedValue([]);
    render(<LifeList />);
    expect(await screen.findByText("No Life at Vyntics images yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add Image" })).toHaveAttribute("href", "/life-at-vyntics/new");
  });
  it("renders a retryable error", async () => {
    vi.mocked(lifeAtVynticsApi.list).mockRejectedValueOnce(new ApiError({ kind: "network", message: "secret" })).mockResolvedValueOnce([lifeFixture]);
    render(<LifeList />);
    expect(await screen.findByText("Unable to load Life at Vyntics.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    expect(await screen.findByText("Position 2")).toBeInTheDocument();
  });
  it("confirms permanent deletion, then refetches the backend-renumbered list", async () => {
    vi.mocked(lifeAtVynticsApi.list).mockResolvedValueOnce([lifeFixture, second]).mockResolvedValueOnce([{ ...second, display_order: 2 }]);
    vi.mocked(lifeAtVynticsApi.delete).mockResolvedValue(undefined);
    render(<LifeList />);
    const del = await screen.findByRole("button", { name: "Delete image 2" });
    expect(del.closest("a")).toBeNull();
    fireEvent.click(del);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("permanently deleted");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(lifeAtVynticsApi.delete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Delete image 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Permanently" }));
    await waitFor(() => expect(lifeAtVynticsApi.delete).toHaveBeenCalledWith("life-1"));
    expect(await screen.findByText("Position 2")).toBeInTheDocument();
    expect(screen.queryByText("Position 3")).toBeNull();
    expect(lifeAtVynticsApi.list).toHaveBeenCalledTimes(2);
  });
  it("shows delete failures and keeps the dialog", async () => {
    vi.mocked(lifeAtVynticsApi.list).mockResolvedValue([lifeFixture]);
    vi.mocked(lifeAtVynticsApi.delete).mockRejectedValue(new ApiError({ kind: "service_unavailable", message: "x" }));
    render(<LifeList />);
    fireEvent.click(await screen.findByRole("button", { name: "Delete image 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Permanently" }));
    expect(await screen.findByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
