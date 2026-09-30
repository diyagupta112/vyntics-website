import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { blogsApi } from "@/features/blogs/api/blogs";
import { careersApi } from "@/features/careers/api/careers";
import { caseStudiesApi } from "@/features/case-studies/api/case-studies";
import { contactSubmissionsApi } from "@/features/contact-submissions/api/contact-submissions";
import { jobApplicationsApi } from "@/features/job-applications/api/job-applications";
import { teamMembersApi } from "@/features/team-members/api/team-members";
import DashboardPage from "./page";

vi.mock("@/features/blogs/api/blogs", () => ({ blogsApi: { list: vi.fn() } }));
vi.mock("@/features/careers/api/careers", () => ({ careersApi: { list: vi.fn() } }));
vi.mock("@/features/case-studies/api/case-studies", () => ({ caseStudiesApi: { list: vi.fn() } }));
vi.mock("@/features/contact-submissions/api/contact-submissions", () => ({ contactSubmissionsApi: { list: vi.fn() } }));
vi.mock("@/features/job-applications/api/job-applications", () => ({ jobApplicationsApi: { listAll: vi.fn() } }));
vi.mock("@/features/team-members/api/team-members", () => ({ teamMembersApi: { list: vi.fn() } }));

describe("DashboardPage", () => {
  it("renders live operational metrics and attention links", async () => {
    vi.mocked(contactSubmissionsApi.list).mockResolvedValue([{ status: "new" }] as never);
    vi.mocked(jobApplicationsApi.listAll).mockResolvedValue([{ status: "new" }] as never);
    vi.mocked(blogsApi.list).mockResolvedValue([{ status: "draft" }, { status: "published" }] as never);
    vi.mocked(caseStudiesApi.list).mockResolvedValue([{ status: "draft" }, { status: "published" }] as never);
    vi.mocked(careersApi.list).mockResolvedValue([{}] as never);
    vi.mocked(teamMembersApi.list).mockResolvedValue([{}, {}] as never);

    render(<DashboardPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
    expect(await screen.findByTestId("dashboard-overview-grid")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /New Contact Submissions 1/ })[0]).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: /Team Members 2/ })).toHaveAttribute("href", "/team");
    expect(screen.getByRole("heading", { name: "Needs attention" })).toBeInTheDocument();
  });
  it("handles empty and error states", async () => {
    vi.mocked(contactSubmissionsApi.list).mockResolvedValue([]);
    vi.mocked(jobApplicationsApi.listAll).mockResolvedValue([]);
    vi.mocked(blogsApi.list).mockResolvedValue([]);
    vi.mocked(caseStudiesApi.list).mockResolvedValue([]);
    vi.mocked(careersApi.list).mockResolvedValue([]);
    vi.mocked(teamMembersApi.list).mockResolvedValue([]);

    const { unmount } = render(<DashboardPage />);
    expect(await screen.findByRole("heading", { name: "Nothing needs attention" })).toBeInTheDocument();
    unmount();

    vi.mocked(blogsApi.list).mockRejectedValue(new Error("offline"));
    render(<DashboardPage />);
    expect(await screen.findByRole("heading", { name: "Dashboard could not be loaded" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
