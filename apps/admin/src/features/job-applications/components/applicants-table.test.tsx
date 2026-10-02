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
  experience_years: 3,
  experience_months: 4,
  currently_working: true,
  current_company: "ABC Technologies",
  notice_period: "30_days",
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

  it("does not open details from the row, name, or email", () => {
    render(<ApplicantsTable applications={[application]} onRemoved={vi.fn()} onUpdated={vi.fn()} />);
    fireEvent.click(screen.getByText("Asha Patel").closest("tr")!);
    fireEvent.click(screen.getByText("Asha Patel"));
    const email = screen.getByRole("link", { name: "asha@example.com" });
    email.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(email);
    expect(screen.queryByRole("dialog", { name: "Asha Patel" })).not.toBeInTheDocument();
    expect(jobApplicationsApi.get).not.toHaveBeenCalled();
  });

  it("opens a dialog only from Details and closes it with Escape", async () => {
    vi.mocked(jobApplicationsApi.get).mockResolvedValue(detail);
    render(<ApplicantsTable applications={[application]} onRemoved={vi.fn()} onUpdated={vi.fn()} />);
    const row = screen.getByText("Asha Patel").closest("tr")!;
    expect(row).not.toHaveAttribute("tabindex");
    const trigger = screen.getByRole("button", { name: "View details for Asha Patel" });
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Asha Patel" });
    expect(within(dialog).getByText("Strong portfolio")).toBeInTheDocument();
    expect(row).not.toHaveAttribute("aria-expanded");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Asha Patel" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("keeps the table Resume action independent from Details", () => {
    vi.mocked(jobApplicationsApi.get).mockResolvedValue(detail);
    render(<ApplicantsTable applications={[application]} onRemoved={vi.fn()} onUpdated={vi.fn()} />);
    fireEvent.click(screen.getByRole("link", { name: "View resume for Asha Patel" }));
    expect(jobApplicationsApi.get).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog", { name: "Asha Patel" })).not.toBeInTheDocument();
  });

  it("loads details safely and shows missing resumes", async () => {
    vi.mocked(jobApplicationsApi.get).mockRejectedValue(
      new ApiError({ kind: "service_unavailable", message: "safe" }),
    );
    render(<ApplicantsTable applications={[{ ...application, resume_url: null }]} onRemoved={vi.fn()} onUpdated={vi.fn()} />);
    expect(screen.getByText("No resume")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View details for Asha Patel" }));
    const dialog = await screen.findByRole("dialog", { name: "Asha Patel" });
    expect(within(dialog).getByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("shows candidate fields with human-readable values and a working Resume link", async () => {
    vi.mocked(jobApplicationsApi.get).mockResolvedValue(detail);
    render(<ApplicantsTable applications={[application]} onRemoved={vi.fn()} onUpdated={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "View details for Asha Patel" }));
    const dialog = await screen.findByRole("dialog", { name: "Asha Patel" });
    expect(within(dialog).getByText("3 years 4 months")).toBeInTheDocument();
    expect(within(dialog).getByText("Yes")).toBeInTheDocument();
    expect(within(dialog).getByText("ABC Technologies")).toBeInTheDocument();
    expect(within(dialog).getByText("30 Days")).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "View resume" })).toHaveAttribute("href", application.resume_url);
  });

  it("shows clean placeholders for nullable candidate fields", async () => {
    const nullableDetail = { ...detail, currently_working: false, current_company: null, notice_period: "immediate" as const };
    vi.mocked(jobApplicationsApi.get).mockResolvedValue(nullableDetail);
    render(<ApplicantsTable applications={[{ ...application, ...nullableDetail }]} onRemoved={vi.fn()} onUpdated={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "View details for Asha Patel" }));
    const dialog = await screen.findByRole("dialog", { name: "Asha Patel" });
    expect(within(dialog).getByText("No")).toBeInTheDocument();
    expect(within(dialog).getByText("Not provided")).toBeInTheDocument();
    expect(within(dialog).getByText("Immediate")).toBeInTheDocument();
  });

  it("updates only status and notes", async () => {
    vi.mocked(jobApplicationsApi.get).mockResolvedValue(detail);
    vi.mocked(jobApplicationsApi.update).mockResolvedValue({ ...detail, status: "shortlisted", notes: null });
    const onUpdated = vi.fn();
    render(<ApplicantsTable applications={[application]} onRemoved={vi.fn()} onUpdated={onUpdated} />);
    fireEvent.click(screen.getByRole("button", { name: "View details for Asha Patel" }));
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
    fireEvent.click(screen.getByRole("button", { name: "View details for Asha Patel" }));
    await screen.findByText("Strong portfolio");
    fireEvent.click(screen.getByRole("button", { name: "Delete Application" }));
    const dialog = screen.getByRole("dialog", { name: /Delete Application/i });
    expect(dialog).toHaveTextContent("Asha Patel");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete Permanently" }));
    await waitFor(() => expect(onRemoved).toHaveBeenCalledWith("application-1"));
  });

  it("keeps the delete confirmation open when deletion fails", async () => {
    vi.mocked(jobApplicationsApi.get).mockResolvedValue(detail);
    vi.mocked(jobApplicationsApi.delete).mockRejectedValue(
      new ApiError({ kind: "service_unavailable", message: "safe" }),
    );
    render(<ApplicantsTable applications={[application]} onRemoved={vi.fn()} onUpdated={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "View details for Asha Patel" }));
    await screen.findByText("Strong portfolio");
    fireEvent.click(screen.getByRole("button", { name: "Delete Application" }));
    const dialog = screen.getByRole("dialog", { name: /Delete Application/i });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete Permanently" }));
    expect(await within(dialog).findByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
  });
});
