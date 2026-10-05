import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { badgesApi } from "../api/badges";
import { badgeFixture } from "../test-fixtures";
import { BadgeCreateWizard } from "./badge-create-wizard";

const push = vi.fn();
vi.mock("next/image", () => ({ default: "img" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../api/badges", () => ({ badgesApi: { create: vi.fn(), update: vi.fn(), uploadLogo: vi.fn(), deleteLogo: vi.fn() } }));

function fillDetails() {
  fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "  Databricks Partner  " } });
  fireEvent.change(screen.getByLabelText(/^Description/), { target: { value: " Trusted partner " } });
  fireEvent.change(screen.getByLabelText(/^Website URL/), { target: { value: "https://example.com" } });
  fireEvent.change(screen.getByLabelText(/^Display order/), { target: { value: "3" } });
  fireEvent.change(screen.getByLabelText(/^Active/), { target: { value: "false" } });
}

describe("BadgeCreateWizard", () => {
  beforeEach(() => vi.clearAllMocks());
  it("validates details and creates the Badge once", async () => {
    vi.mocked(badgesApi.create).mockResolvedValue(badgeFixture);
    render(<BadgeCreateWizard />);
    expect(screen.getAllByText("Step 1 of 2")).toHaveLength(2);
    fireEvent.change(screen.getByLabelText(/^Website URL/), { target: { value: "ftp://invalid" } });
    fireEvent.click(screen.getByRole("button", { name: "Next →" }));
    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid HTTP or HTTPS URL.")).toBeInTheDocument();
    fillDetails();
    fireEvent.click(screen.getByRole("button", { name: "Next →" }));
    await waitFor(() => expect(badgesApi.create).toHaveBeenCalledWith({ name: "Databricks Partner", description: "Trusted partner", website_url: "https://example.com", display_order: 3, is_active: false }));
    expect(await screen.findByRole("heading", { name: "Badge Logo" })).toBeInTheDocument();
  });
  it("uses PATCH after Back and never creates a duplicate", async () => {
    vi.mocked(badgesApi.create).mockResolvedValue(badgeFixture);
    vi.mocked(badgesApi.update).mockResolvedValue({ ...badgeFixture, name: "Updated Partner" });
    render(<BadgeCreateWizard />); fillDetails(); fireEvent.click(screen.getByRole("button", { name: "Next →" }));
    await screen.findByRole("heading", { name: "Badge Logo" });
    fireEvent.click(screen.getByRole("button", { name: "← Back" }));
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Updated Partner" } });
    fireEvent.click(screen.getByRole("button", { name: "Next →" }));
    await waitFor(() => expect(badgesApi.update).toHaveBeenCalledWith(badgeFixture.id, expect.objectContaining({ name: "Updated Partner" })));
    expect(badgesApi.create).toHaveBeenCalledTimes(1);
  });
  it("retries a failed logo upload without creating another Badge", async () => {
    vi.mocked(badgesApi.create).mockResolvedValue(badgeFixture);
    vi.mocked(badgesApi.uploadLogo).mockRejectedValueOnce(new ApiError({ kind: "service_unavailable", message: "safe" })).mockResolvedValueOnce({ ...badgeFixture, logo_url: "https://example.com/new.png" });
    render(<BadgeCreateWizard />); fillDetails(); fireEvent.click(screen.getByRole("button", { name: "Next →" }));
    const input = await screen.findByLabelText("Choose Badge logo");
    const file = new File(["image"], "logo.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/temporarily unavailable/i)).toBeInTheDocument();
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(badgesApi.uploadLogo).toHaveBeenCalledTimes(2));
    expect(badgesApi.create).toHaveBeenCalledTimes(1);
  });
  it("finishes gracefully without a logo", async () => {
    vi.mocked(badgesApi.create).mockResolvedValue({ ...badgeFixture, logo_url: null });
    render(<BadgeCreateWizard />); fillDetails(); fireEvent.click(screen.getByRole("button", { name: "Next →" }));
    fireEvent.click(await screen.findByRole("button", { name: "Save & Finish" }));
    expect(push).toHaveBeenCalledWith(`/badges/${badgeFixture.id}/edit?created=1`);
    expect(badgesApi.uploadLogo).not.toHaveBeenCalled();
  });
});
