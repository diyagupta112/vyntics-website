import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { caseStudiesApi } from "../api/case-studies";
import type { CaseStudy } from "../types";
import { CaseStudyCreateWizard } from "./case-study-create-wizard";
import { CaseStudyForm } from "./case-study-form";

const push = vi.fn();
vi.mock("next/image", () => ({ default: "img" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../api/case-studies", () => ({ caseStudiesApi: { create: vi.fn(), update: vi.fn(), uploadCover: vi.fn(), deleteCover: vi.fn(), uploadContentImage: vi.fn() } }));
// Exposes how the form wires the real editor's Image action without rendering ProseMirror.
vi.mock("@/components/forms/rich-text-editor", () => ({
  RichTextEditor: ({ id, value, onChange, imageUpload }: { id: string; value: string; onChange: (value: string) => void; imageUpload?: ((file: File) => Promise<unknown>) | null }) => (
    <div>
      <textarea aria-label="Case Study content editor" id={id} onChange={(event) => onChange(event.target.value)} value={value} />
      <button disabled={imageUpload === null} onClick={() => void imageUpload?.(new File(["x"], "a.png", { type: "image/png" }))} type="button">Image</button>
    </div>
  ),
}));

const blog: CaseStudy = { related_services: [], related_sub_services: [], id: "study-1", slug: "platform", title: "Platform", seo_title: "Platform | Vyntics", meta_description: "Meta", client_name: "Client", excerpt: "Results", cover_image_url: null, tech_stack: [], tags: [], content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Body" }] }] }, featured: false, status: "draft", published_at: null, created_at: "2026-09-28T00:00:00Z", updated_at: "2026-09-28T00:00:00Z" };

function fillBlog() {
  const values: Record<string, string> = { caseStudyTitle: "Platform", caseStudySlug: "platform", caseStudyClientName: "Client", caseStudyExcerpt: "Results", caseStudySeoTitle: "Platform | Vyntics", caseStudyMetaDescription: "Meta", caseStudyContent: JSON.stringify(blog.content) };
  for (const [id, value] of Object.entries(values)) fireEvent.change(document.getElementById(id)!, { target: { value } });
}

describe("Case Study body image availability", () => {
  beforeEach(() => vi.clearAllMocks());
  it("is unavailable on a new Case Study and uses the saved ID on an existing one", async () => {
    const { unmount } = render(<CaseStudyForm />);
    expect(screen.getByRole("button", { name: "Image" })).toBeDisabled();
    unmount();
    vi.mocked(caseStudiesApi.uploadContentImage).mockResolvedValue({ url: "u", content_type: "image/png", size_bytes: 1 });
    render(<CaseStudyForm caseStudy={blog} />);
    expect(screen.getByRole("button", { name: "Image" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Image" }));
    await waitFor(() => expect(caseStudiesApi.uploadContentImage).toHaveBeenCalledWith("study-1", expect.any(File)));
  });
  it("becomes enabled with the created ID after Back, without creating a duplicate", async () => {
    vi.mocked(caseStudiesApi.create).mockResolvedValue(blog);
    vi.mocked(caseStudiesApi.update).mockResolvedValue(blog);
    vi.mocked(caseStudiesApi.uploadContentImage).mockResolvedValue({ url: "u", content_type: "image/png", size_bytes: 1 });
    render(<CaseStudyCreateWizard />);
    expect(screen.getByRole("button", { name: "Image" })).toBeDisabled();
    fillBlog();
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    await screen.findByRole("heading", { name: "Add Cover Image" });
    fireEvent.click(screen.getByRole("button", { name: "← Back" }));
    expect(screen.getByRole("button", { name: "Image" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Image" }));
    await waitFor(() => expect(caseStudiesApi.uploadContentImage).toHaveBeenCalledWith("study-1", expect.any(File)));
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    await waitFor(() => expect(caseStudiesApi.update).toHaveBeenCalledTimes(1));
    expect(caseStudiesApi.create).toHaveBeenCalledTimes(1);
  });
});
