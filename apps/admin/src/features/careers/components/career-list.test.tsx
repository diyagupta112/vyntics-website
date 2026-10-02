import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { careersApi } from "../api/careers";
import type { CareerListItem } from "../types";
import { CareerList } from "./career-list";

vi.mock("../api/careers", () => ({
  careersApi: { list: vi.fn(), delete: vi.fn() },
}));

const career: CareerListItem = {
  id: "career-1",
  slug: "senior-engineer",
  title: "Senior Engineer",
  location: "Remote",
  employment_type: "Full-time",
  department: "Engineering",
  experience: "5+ years",
  short_description: "Build reliable products with the Vyntics team.",
  published_at: "2026-09-29T00:00:00Z",
};

describe("CareerList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows loading then renders a card-based Career list", async () => {
    vi.mocked(careersApi.list).mockResolvedValue([career]);
    render(<CareerList />);

    expect(
      screen.getByRole("status", { name: "Loading Careers" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete Senior Engineer" }).className,
    ).toMatch(/destructive/);
  });

  it("preserves Career identity in the future applicants navigation", async () => {
    vi.mocked(careersApi.list).mockResolvedValue([career]);
    render(<CareerList />);

    const link = await screen.findByRole("link", {
      name: "See Applicants for This Role",
    });
    expect(link).toHaveAttribute(
      "href",
      "/job-applications?careerId=career-1",
    );
  });

  it("renders the empty state", async () => {
    vi.mocked(careersApi.list).mockResolvedValue([]);
    render(<CareerList />);
    expect(await screen.findByText("No Careers available")).toBeInTheDocument();
  });

  it("renders a safe error and supports retry", async () => {
    vi.mocked(careersApi.list)
      .mockRejectedValueOnce(new ApiError({ kind: "network", message: "safe" }))
      .mockResolvedValueOnce([career]);
    render(<CareerList />);

    expect(
      await screen.findByText(/backend could not be reached/i),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Senior Engineer")).toBeInTheDocument();
  });

  it("confirms and completes permanent deletion", async () => {
    vi.mocked(careersApi.list).mockResolvedValue([career]);
    vi.mocked(careersApi.delete).mockResolvedValue(undefined);
    render(<CareerList />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Delete Senior Engineer" }),
    );
    expect(screen.getByRole("dialog")).toHaveTextContent("cannot be undone");
    fireEvent.click(screen.getByRole("button", { name: "Delete Permanently" }));
    await waitFor(() =>
      expect(careersApi.delete).toHaveBeenCalledWith("career-1"),
    );
    await waitFor(() =>
      expect(screen.queryByText("Senior Engineer")).not.toBeInTheDocument(),
    );
  });

  it("keeps the confirmation open when deletion fails", async () => {
    vi.mocked(careersApi.list).mockResolvedValue([career]);
    vi.mocked(careersApi.delete).mockRejectedValue(
      new ApiError({ kind: "service_unavailable", message: "safe" }),
    );
    render(<CareerList />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Delete Senior Engineer" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete Permanently" }));
    expect(await screen.findByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
