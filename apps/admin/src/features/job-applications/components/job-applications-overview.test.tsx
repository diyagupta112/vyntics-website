import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { downloadFile } from "@/lib/api/download";
import { careersApi } from "@/features/careers/api/careers";
import { jobApplicationsApi } from "../api/job-applications";
import type { JobApplicationListItem } from "../types";
import { JobApplicationsOverview } from "./job-applications-overview";

vi.mock("@/lib/api/download", () => ({ downloadFile: vi.fn() }));

const replace = vi.fn();
let careerId: string | null = null;
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => ({ get: () => careerId }),
}));
vi.mock("@/features/careers/api/careers", () => ({ careersApi: { list: vi.fn() } }));
vi.mock("../api/job-applications", () => ({
  jobApplicationsApi: { export: vi.fn(), listAll: vi.fn(), listForCareer: vi.fn(), get: vi.fn(), update: vi.fn(), delete: vi.fn() },
}));

const careers = [{ id: "career-1", slug: "senior-engineer", title: "Senior Engineer", location: "Remote", employment_type: "Full-time", department: "Engineering", experience: "5+ years", short_description: "Build products", published_at: "2026-09-29T00:00:00Z" }];
const application: JobApplicationListItem = { id: "application-1", career_id: "career-1", career_title_snapshot: "Senior Engineer", career_slug_snapshot: "senior-engineer", name: "Asha Patel", email: "asha@example.com", phone: "123", experience_years: 3, experience_months: 4, currently_working: true, current_company: "ABC Technologies", notice_period: "30_days", status: "new", submitted_at: "2026-09-29T00:00:00Z", resume_url: null };

describe("JobApplicationsOverview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    careerId = null;
    vi.mocked(careersApi.list).mockResolvedValue(careers);
    vi.mocked(jobApplicationsApi.listAll).mockResolvedValue([application]);
    vi.mocked(jobApplicationsApi.listForCareer).mockResolvedValue([application]);
  });

  it.each([null, "career-1"])("exports the current scope %s without blocking empty results", async (scope) => {
    careerId = scope;
    vi.mocked(jobApplicationsApi.listAll).mockResolvedValue([]);
    vi.mocked(jobApplicationsApi.listForCareer).mockResolvedValue([]);
    const file = { blob: new Blob(["xlsx"]), disposition: 'attachment; filename="backend.xlsx"' };
    let resolve: ((value: typeof file) => void) | undefined;
    vi.mocked(jobApplicationsApi.export).mockReturnValue(new Promise((done) => { resolve = done; }));
    render(<JobApplicationsOverview />);
    await screen.findByRole("button", { name: "Senior Engineer" });
    fireEvent.click(screen.getByRole("button", { name: "Export to Sheets" }));
    expect(jobApplicationsApi.export).toHaveBeenCalledWith(scope ?? undefined);
    const busy = screen.getByRole("button", { name: "Exporting…" });
    expect(busy).toBeDisabled();
    fireEvent.click(busy);
    expect(jobApplicationsApi.export).toHaveBeenCalledTimes(1);
    resolve?.(file);
    await waitFor(() => expect(downloadFile).toHaveBeenCalledWith(file, scope ? "Vyntics_Job_Applications_Senior_Engineer.xlsx" : "Vyntics_Job_Applications_All.xlsx"));
    expect(screen.getByRole("button", { name: "Export to Sheets" })).toBeEnabled();
  });

  it("keeps applicants visible when an export fails", async () => {
    vi.mocked(jobApplicationsApi.export).mockRejectedValue(new Error("private stack"));
    render(<JobApplicationsOverview />);
    await screen.findByText("Asha Patel");
    fireEvent.click(screen.getByRole("button", { name: "Export to Sheets" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("We could not export Job Applications. Please try again.");
    expect(screen.getByText("Asha Patel")).toBeInTheDocument();
    expect(downloadFile).not.toHaveBeenCalled();
  });

  it("loads All Applicants and renders Career scope cards", async () => {
    render(<JobApplicationsOverview />);
    expect(screen.getByRole("status", { name: "Loading Job Applications" })).toBeInTheDocument();
    expect(await screen.findByText("Asha Patel")).toBeInTheDocument();
    expect(jobApplicationsApi.listAll).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Senior Engineer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /All Applicants/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("consumes the Careers careerId context automatically", async () => {
    careerId = "career-1";
    render(<JobApplicationsOverview />);
    expect(await screen.findByText("Asha Patel")).toBeInTheDocument();
    expect(jobApplicationsApi.listForCareer).toHaveBeenCalledWith("career-1");
    expect(screen.getByRole("button", { name: "Senior Engineer" })).toHaveAttribute("aria-pressed", "true");
  });

  it("opens applicant details in a career-specific view", async () => {
    careerId = "career-1";
    vi.mocked(jobApplicationsApi.get).mockResolvedValue({ ...application, cover_letter: null, notes: null });
    render(<JobApplicationsOverview />);
    fireEvent.click(await screen.findByRole("button", { name: "View details for Asha Patel" }));
    expect(await screen.findByRole("dialog", { name: "Asha Patel" })).toHaveTextContent("3 years 4 months");
  });

  it("updates the URL when scope changes", async () => {
    render(<JobApplicationsOverview />);
    await screen.findByText("Asha Patel");
    fireEvent.click(screen.getByRole("button", { name: "Senior Engineer" }));
    expect(replace).toHaveBeenCalledWith("/job-applications?careerId=career-1");
  });

  it("distinguishes the Career-specific empty state", async () => {
    careerId = "career-1";
    vi.mocked(jobApplicationsApi.listForCareer).mockResolvedValue([]);
    render(<JobApplicationsOverview />);
    expect(await screen.findByText("No applications for Senior Engineer")).toBeInTheDocument();
  });

  it("renders safe errors and retry behavior", async () => {
    vi.mocked(jobApplicationsApi.listAll).mockRejectedValue(new ApiError({ kind: "network", message: "safe" }));
    render(<JobApplicationsOverview />);
    expect(await screen.findByText(/backend could not be reached/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
