import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { caseStudiesApi } from "../api/case-studies";
import type { CaseStudy } from "../types";
import { CaseStudyForm } from "./case-study-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../api/case-studies", () => ({
  caseStudiesApi: { create: vi.fn(), update: vi.fn() },
}));

const caseStudy: CaseStudy = {
  id: "1",
  slug: "platform-redesign",
  title: "Platform redesign",
  seo_title: "Platform redesign | Vyntics",
  meta_description: "Metadata",
  client_name: "Example Client",
  excerpt: "A concise result summary.",
  cover_image_url: "https://example.com/cover.jpg",
  tech_stack: ["Python", "FastAPI"],
  tags: ["API", "Engineering"],
  content: { type: "doc" },
  status: "draft",
  published_at: null,
  created_at: "2026-09-28T00:00:00Z",
  updated_at: "2026-09-28T00:00:00Z",
};

describe("CaseStudyForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows required-field validation", () => {
    render(<CaseStudyForm />);
    fireEvent.click(screen.getByRole("button", { name: "Create Case Study" }));
    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    expect(screen.getByText("Client name is required.")).toBeInTheDocument();
    expect(caseStudiesApi.create).not.toHaveBeenCalled();
  });

  it("creates a Case Study and moves to its edit page", async () => {
    vi.mocked(caseStudiesApi.create).mockResolvedValue(caseStudy);
    render(<CaseStudyForm />);
    const values: Record<string, string> = {
      caseStudyTitle: "Platform redesign",
      caseStudySlug: "platform-redesign",
      caseStudyClientName: "Example Client",
      caseStudyExcerpt: "A concise result summary.",
      caseStudySeoTitle: "Platform redesign | Vyntics",
      caseStudyMetaDescription: "Metadata",
      caseStudyTechStack: "Python, FastAPI",
      caseStudyTags: "API, Engineering",
    };
    for (const [id, value] of Object.entries(values)) {
      fireEvent.change(document.getElementById(id)!, { target: { value } });
    }
    fireEvent.click(screen.getByRole("button", { name: "Create Case Study" }));
    await waitFor(() => expect(caseStudiesApi.create).toHaveBeenCalled());
    expect(push).toHaveBeenCalledWith("/case-studies/1/edit?created=1");
  });

  it("populates fields and saves status changes", async () => {
    vi.mocked(caseStudiesApi.update).mockResolvedValue({
      ...caseStudy,
      status: "published",
    });
    render(<CaseStudyForm caseStudy={caseStudy} />);
    expect(screen.getByLabelText(/^Title/)).toHaveValue("Platform redesign");
    expect(
      screen.getByRole("textbox", { name: "Tech stack" }),
    ).toHaveValue("Python, FastAPI");
    fireEvent.change(screen.getByLabelText(/^Status/), {
      target: { value: "published" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() =>
      expect(caseStudiesApi.update).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ status: "published" }),
      ),
    );
    expect(await screen.findByText("Case Study changes saved.")).toBeInTheDocument();
  });

  it.each([
    ["validation", "Backend says invalid"],
    ["permission", "permission"],
    ["service_unavailable", "temporarily unavailable"],
    ["network", "could not be reached"],
  ] as const)("shows safe %s save failures", async (kind, expected) => {
    vi.mocked(caseStudiesApi.update).mockRejectedValue(
      new ApiError({
        kind,
        message: kind === "validation" ? "Backend says invalid" : "safe",
      }),
    );
    render(<CaseStudyForm caseStudy={caseStudy} />);
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(caseStudiesApi.update).toHaveBeenCalled());
    expect(await screen.findByText(new RegExp(expected, "i"))).toBeInTheDocument();
  });

  it("prevents duplicate save submission while pending", async () => {
    vi.mocked(caseStudiesApi.update).mockReturnValue(new Promise(() => {}));
    render(<CaseStudyForm caseStudy={caseStudy} />);
    const button = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(button);
    expect(await screen.findByRole("button", { name: "Saving…" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Saving…" }));
    expect(caseStudiesApi.update).toHaveBeenCalledTimes(1);
  });
});
