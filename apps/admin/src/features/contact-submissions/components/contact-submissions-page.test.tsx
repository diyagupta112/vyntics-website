import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { contactSubmissionsApi } from "../api/contact-submissions";
import type { ContactSubmission } from "../types";
import { ContactSubmissionsPage } from "./contact-submissions-page";

vi.mock("../api/contact-submissions", () => ({
  contactSubmissionsApi: { delete: vi.fn(), get: vi.fn(), list: vi.fn() },
}));

const submission: ContactSubmission = {
  id: "submission-1",
  name: "Asha Patel",
  email: "asha@example.com",
  company: "Example Company",
  subject: "A detailed analytics project enquiry for the Vyntics team",
  message:
    "This is a deliberately long contact message that contains enough information to require truncation in the compact submissions table while remaining complete in the detail dialog.",
  source_page: "/services/data-analytics-and-business-intelligence",
  status: "new",
  notes: null,
  submitted_at: "2026-09-29T08:00:00Z",
  resolved_at: null,
  resolved_by: null,
};

describe("ContactSubmissionsPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows loading and then renders the compact table with truncated content", async () => {
    vi.mocked(contactSubmissionsApi.list).mockResolvedValue([submission]);
    render(<ContactSubmissionsPage />);

    expect(
      screen.getByRole("status", { name: "Loading Contact Submissions" }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("columnheader", { name: "Message" })).toBeInTheDocument();
    for (const heading of ["Name", "Email", "Company", "Subject", "Source Page", "Actions"]) {
      expect(screen.getByRole("columnheader", { name: heading })).toBeInTheDocument();
    }
    expect(screen.getByText(/This is a deliberately long contact message.+\.\.\.$/)).toBeInTheDocument();
    expect(screen.queryByText(submission.message)).not.toBeInTheDocument();
  });

  it("renders the empty state", async () => {
    vi.mocked(contactSubmissionsApi.list).mockResolvedValue([]);
    render(<ContactSubmissionsPage />);
    expect(await screen.findByText("No contact submissions yet.")).toBeInTheDocument();
  });

  it("renders a safe load error and supports retry", async () => {
    vi.mocked(contactSubmissionsApi.list)
      .mockRejectedValueOnce(new ApiError({ kind: "network", message: "safe" }))
      .mockResolvedValueOnce([submission]);
    render(<ContactSubmissionsPage />);

    expect(await screen.findByText(/backend could not be reached/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Asha Patel")).toBeInTheDocument();
  });

  it("opens full details from a row and closes the dialog", async () => {
    vi.mocked(contactSubmissionsApi.list).mockResolvedValue([submission]);
    vi.mocked(contactSubmissionsApi.get).mockResolvedValue(submission);
    render(<ContactSubmissionsPage />);

    const row = await screen.findByRole("row", { name: "Open submission from Asha Patel" });
    fireEvent.click(row);
    const dialog = screen.getByRole("dialog", { name: "Contact Submission" });
    expect(await within(dialog).findByText(submission.message)).toBeInTheDocument();
    expect(contactSubmissionsApi.get).toHaveBeenCalledWith("submission-1");
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog", { name: "Contact Submission" })).not.toBeInTheDocument();
  });

  it("opens full details with the keyboard", async () => {
    vi.mocked(contactSubmissionsApi.list).mockResolvedValue([submission]);
    vi.mocked(contactSubmissionsApi.get).mockResolvedValue(submission);
    render(<ContactSubmissionsPage />);

    const row = await screen.findByRole("row", { name: "Open submission from Asha Patel" });
    fireEvent.keyDown(row, { key: "Enter" });
    expect(await screen.findByRole("dialog", { name: "Contact Submission" })).toBeInTheDocument();
  });

  it("confirms deletion, removes the row, and shows success feedback", async () => {
    vi.mocked(contactSubmissionsApi.list).mockResolvedValue([submission]);
    vi.mocked(contactSubmissionsApi.delete).mockResolvedValue(undefined);
    render(<ContactSubmissionsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Delete submission from Asha Patel" }));
    const dialog = screen.getByRole("dialog", { name: /Delete Contact Submission/i });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete Permanently" }));

    await waitFor(() => expect(contactSubmissionsApi.delete).toHaveBeenCalledWith("submission-1"));
    expect(await screen.findByRole("status")).toHaveTextContent("Submission from Asha Patel deleted.");
    expect(screen.queryByText("asha@example.com")).not.toBeInTheDocument();
  });

  it("keeps confirmation open and reports a safe deletion error", async () => {
    vi.mocked(contactSubmissionsApi.list).mockResolvedValue([submission]);
    vi.mocked(contactSubmissionsApi.delete).mockRejectedValue(
      new ApiError({ kind: "service_unavailable", message: "provider detail" }),
    );
    render(<ContactSubmissionsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Delete submission from Asha Patel" }));
    const dialog = screen.getByRole("dialog", { name: /Delete Contact Submission/i });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete Permanently" }));

    expect(await within(dialog).findByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
    expect(dialog).not.toHaveTextContent("provider detail");
  });
});
