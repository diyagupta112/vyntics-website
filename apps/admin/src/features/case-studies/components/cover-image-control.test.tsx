import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { caseStudiesApi } from "../api/case-studies";
import type { CaseStudy } from "../types";
import { CoverImageControl } from "./cover-image-control";

vi.mock("next/image", () => ({ default: "img" }));
vi.mock("../api/case-studies", () => ({
  caseStudiesApi: { uploadCover: vi.fn(), deleteCover: vi.fn() },
}));

const caseStudy: CaseStudy = {
  id: "1",
  slug: "platform-redesign",
  title: "Platform redesign",
  seo_title: "SEO",
  meta_description: "Metadata",
  client_name: "Example Client",
  excerpt: "Excerpt",
  cover_image_url: null,
  tech_stack: [],
  tags: [],
  content: {},
  status: "draft",
  published_at: null,
  created_at: "2026-09-28T00:00:00Z",
  updated_at: "2026-09-28T00:00:00Z",
};

describe("Case Study CoverImageControl", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uploads a validated image", async () => {
    const changed = vi.fn();
    vi.mocked(caseStudiesApi.uploadCover).mockResolvedValue({
      ...caseStudy,
      cover_image_url: "https://example.com/new.jpg",
    });
    render(<CoverImageControl caseStudy={caseStudy} onChanged={changed} />);
    fireEvent.change(screen.getByLabelText("Choose Case Study cover image"), {
      target: {
        files: [new File(["jpeg"], "cover.jpg", { type: "image/jpeg" })],
      },
    });
    await waitFor(() => expect(changed).toHaveBeenCalled());
    expect(screen.getByText("Cover image uploaded.")).toBeInTheDocument();
  });

  it("shows safe upload errors and rejects invalid files locally", async () => {
    vi.mocked(caseStudiesApi.uploadCover).mockRejectedValue(
      new ApiError({
        kind: "service_unavailable",
        message: "provider internals",
      }),
    );
    render(<CoverImageControl caseStudy={caseStudy} onChanged={vi.fn()} />);
    const input = screen.getByLabelText("Choose Case Study cover image");
    fireEvent.change(input, {
      target: {
        files: [new File(["gif"], "cover.gif", { type: "image/gif" })],
      },
    });
    expect(screen.getByText("Choose a JPEG, PNG, or WebP image.")).toBeInTheDocument();
    expect(caseStudiesApi.uploadCover).not.toHaveBeenCalled();

    fireEvent.change(input, {
      target: {
        files: [new File(["jpeg"], "cover.jpg", { type: "image/jpeg" })],
      },
    });
    expect(await screen.findByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText("provider internals")).not.toBeInTheDocument();
  });

  it("deletes draft covers and prevents published cover deletion", async () => {
    const covered = {
      ...caseStudy,
      cover_image_url: "https://example.com/cover.jpg",
    };
    const changed = vi.fn();
    vi.mocked(caseStudiesApi.deleteCover).mockResolvedValue(undefined);
    const { rerender } = render(
      <CoverImageControl caseStudy={covered} onChanged={changed} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove cover" }));
    await waitFor(() =>
      expect(caseStudiesApi.deleteCover).toHaveBeenCalledWith("1"),
    );

    rerender(
      <CoverImageControl
        caseStudy={{ ...covered, status: "published" }}
        onChanged={changed}
      />,
    );
    expect(screen.getByRole("button", { name: "Remove cover" })).toBeDisabled();
    expect(screen.getByText(/draft or unpublished/i)).toBeInTheDocument();
  });
});
