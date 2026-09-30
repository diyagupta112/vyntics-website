import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { jobApplicationsApi } from "../api/job-applications";
import type { JobApplicationDetail, JobApplicationListItem } from "../types";
import { ApplicantsTable } from "./applicants-table";

vi.mock("../api/job-applications", () => ({
  jobApplicationsApi: { get: vi.fn(), update: vi.fn(), delete: vi.fn() },
}));

const application: JobApplicationListItem = {
  id: "application-1",
  career_id: "career-1",
  career_title_snapshot: "Senior Engineer",
  career_slug_snapshot: "senior-engineer",
  name: "Asha Patel",
  email: "asha@example.com",
  phone: "+91 99999 99999",
  status: "new",
  submitted_at: "2026-09-29T00:00:00Z",
  resume_url: "https://storage.example.test/signed-resume",
};

const detail: JobApplicationDetail = {
  ...application,
  cover_letter: "I would like to join the team.",
  notes: "Strong portfolio",
};

describe("ApplicantsTable", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the required columns and application status", () => {
    render(<ApplicantsTable applications={[application]} onRemoved={vi.fn()} onUpdated={vi.fn()} />);
    for (const heading of ["Name", "Email", "Mobile", "Status", "Resume", "Details"]) {
      expect(screen.getByRole("columnheader", { name: heading })).toBeInTheDocument();
    }
    expect(screen.getByText("new")).toBeInTheDocument();
  });

  it("expands from the whole row and collapses predictably", async () => {
    vi.mocked(jobApplicationsApi.get).mockResolvedValue(detail);
    render(<ApplicantsTable applications={[application]} onRemoved={vi.fn()} onUpdated={vi.fn()} />);
    const row = screen.getByText("Asha Patel").closest("tr")!;
    fireEvent.click(row);
    expect(await screen.findByText("Strong portfolio")).toBeInTheDocument();
    expect(row).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(row, { key: "Enter" });
    expect(screen.queryByText("Strong portfolio")).not.toBeInTheDocument();
  });

  it("expands from Details and keeps Resume independent", async () => {
    vi.mocked(jobApplicationsApi.get).mockResolvedValue(detail);
    render(<ApplicantsTable applications={[application]} onRemoved={vi.fn()} onUpdated={vi.fn()} />);
    fireEvent.click(screen.getByRole("link", { name: "View resume for Asha Patel" }));
    expect(jobApplicationsApi.get).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Show details for Asha Patel" }));
    expect(await screen.findByText("Strong portfolio")).toBeInTheDocument();
  });

  it("loads details safely and shows missing resumes", async () => {
    vi.mocked(jobApplicationsApi.get).mockRejectedValue(
      new ApiError({ kind: "service_unavailable", message: "safe" }),
    );
    render(<ApplicantsTable applications={[{ ...application, resume_url: null }]} onRemoved={vi.fn()} onUpdated={vi.fn()} />);
    expect(screen.getByText("No resume")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Asha Patel").closest("tr")!);
    expect(await screen.findByText(/temporarily unavailable/i)).toBeInTheDocument();
  });

  it("updates only status and notes", async () => {
    vi.mocked(jobApplicationsApi.get).mockResolvedValue(detail);
    vi.mocked(jobApplicationsApi.update).mockResolvedValue({ ...detail, status: "shortlisted", notes: null });
    const onUpdated = vi.fn();
    render(<ApplicantsTable applications={[application]} onRemoved={vi.fn()} onUpdated={onUpdated} />);
    fireEvent.click(screen.getByRole("button", { name: "Show details for Asha Patel" }));
    await screen.findByText("Strong portfolio");
    fireEvent.change(screen.getByLabelText(/^Status/), { target: { value: "shortlisted" } });
    fireEvent.change(screen.getByLabelText(/^Notes/), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(jobApplicationsApi.update).toHaveBeenCalledWith("application-1", { status: "shortlisted", notes: null }));
    expect(onUpdated).toHaveBeenCalled();
  });

  it("confirms deletion and removes the application", async () => {
    vi.mocked(jobApplicationsApi.get).mockResolvedValue(detail);
    vi.mocked(jobApplicationsApi.delete).mockResolvedValue(undefined);
    const onRemoved = vi.fn();
    render(<ApplicantsTable applications={[application]} onRemoved={onRemoved} onUpdated={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Show details for Asha Patel" }));
    await screen.findByText("Strong portfolio");
    fireEvent.click(screen.getByRole("button", { name: "Delete Application" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Asha Patel");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete Application" }));
    await waitFor(() => expect(onRemoved).toHaveBeenCalledWith("application-1"));
  });

  it("keeps the delete confirmation open when deletion fails", async () => {
    vi.mocked(jobApplicationsApi.get).mockResolvedValue(detail);
    vi.mocked(jobApplicationsApi.delete).mockRejectedValue(
      new ApiError({ kind: "service_unavailable", message: "safe" }),
    );
    render(<ApplicantsTable applications={[application]} onRemoved={vi.fn()} onUpdated={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Show details for Asha Patel" }));
    await screen.findByText("Strong portfolio");
    fireEvent.click(screen.getByRole("button", { name: "Delete Application" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete Application" }));
    expect(await within(dialog).findByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
  });
});
