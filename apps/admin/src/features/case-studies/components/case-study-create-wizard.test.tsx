import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { caseStudiesApi } from "../api/case-studies";
import type { CaseStudy } from "../types";
import { CaseStudyCreateWizard } from "./case-study-create-wizard";

const push = vi.fn();
vi.mock("next/image", () => ({ default: "img" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../api/case-studies", () => ({ caseStudiesApi: { create: vi.fn(), update: vi.fn(), uploadCover: vi.fn(), deleteCover: vi.fn() } }));

const study: CaseStudy = { id: "study-1", slug: "platform", title: "Platform", seo_title: "Platform | Vyntics", meta_description: "Meta", client_name: "Client", excerpt: "Results", cover_image_url: null, tech_stack: [], tags: [], content: { type: "doc" }, status: "draft", published_at: null, created_at: "2026-09-28T00:00:00Z", updated_at: "2026-09-28T00:00:00Z" };

function fillStudy() {
  const values: Record<string, string> = { caseStudyTitle: "Platform", caseStudySlug: "platform", caseStudyClientName: "Client", caseStudyExcerpt: "Results", caseStudySeoTitle: "Platform | Vyntics", caseStudyMetaDescription: "Meta" };
  for (const [id, value] of Object.entries(values)) fireEvent.change(document.getElementById(id)!, { target: { value } });
}

describe("CaseStudyCreateWizard", () => {
  beforeEach(() => vi.clearAllMocks());
  it("creates once, uses PATCH after Back, uploads the cover, and finishes", async () => {
    vi.mocked(caseStudiesApi.create).mockResolvedValue(study);
    vi.mocked(caseStudiesApi.update).mockResolvedValue({ ...study, title: "Updated Platform" });
    vi.mocked(caseStudiesApi.uploadCover).mockResolvedValue({ ...study, title: "Updated Platform", cover_image_url: "https://example.com/cover.jpg" });
    render(<CaseStudyCreateWizard />);
    expect(screen.getByRole("heading", { name: "Add Case Study Content" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    fillStudy(); fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(await screen.findByRole("heading", { name: "Add Cover Image" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "← Back" }));
    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Updated Platform" } });
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    await waitFor(() => expect(caseStudiesApi.update).toHaveBeenCalledWith("study-1", expect.objectContaining({ title: "Updated Platform" })));
    expect(caseStudiesApi.create).toHaveBeenCalledTimes(1);
    const file = new File(["image"], "cover.webp", { type: "image/webp" });
    fireEvent.change(screen.getByLabelText("Choose Case Study cover image"), { target: { files: [file] } });
    await waitFor(() => expect(caseStudiesApi.uploadCover).toHaveBeenCalledWith("study-1", file));
    fireEvent.click(screen.getByRole("button", { name: "Save & Finish" }));
    expect(push).toHaveBeenCalledWith("/case-studies/study-1/edit?created=1");
  });
});
