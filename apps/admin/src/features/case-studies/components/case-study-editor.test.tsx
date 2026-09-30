import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { caseStudiesApi } from "../api/case-studies";
import type { CaseStudy } from "../types";
import { CaseStudyEditor } from "./case-study-editor";

vi.mock("next/image", () => ({ default: "img" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("../api/case-studies", () => ({
  caseStudiesApi: {
    get: vi.fn(),
    update: vi.fn(),
    uploadCover: vi.fn(),
    deleteCover: vi.fn(),
  },
}));

const caseStudy: CaseStudy = {
  id: "1",
  slug: "platform-redesign",
  title: "Platform redesign",
  seo_title: "SEO",
  meta_description: "Metadata",
  client_name: "Example Client",
  excerpt: "Excerpt",
  cover_image_url: "https://example.com/cover.jpg",
  tech_stack: [],
  tags: [],
  content: {},
  status: "draft",
  published_at: null,
  created_at: "2026-09-28T00:00:00Z",
  updated_at: "2026-09-28T00:00:00Z",
};

describe("CaseStudyEditor", () => {
  it("renders the cover beside the populated form", async () => {
    vi.mocked(caseStudiesApi.get).mockResolvedValue(caseStudy);
    render(<CaseStudyEditor caseStudyId="1" />);
    const cover = await screen.findByRole("img", {
      name: "Cover for Platform redesign",
    });
    const title = screen.getByRole("heading", {
      level: 1,
      name: "Platform redesign",
    });
    expect(
      title.compareDocumentPosition(cover) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByLabelText(/^Client name/)).toHaveValue("Example Client");
  });

  it("shows a not-found state", async () => {
    vi.mocked(caseStudiesApi.get).mockRejectedValue(
      new ApiError({ kind: "not_found", message: "safe" }),
    );
    render(<CaseStudyEditor caseStudyId="missing" />);
    expect(await screen.findByText("Case Study unavailable")).toBeInTheDocument();
    expect(screen.getByText("This Case Study no longer exists.")).toBeInTheDocument();
  });
});
