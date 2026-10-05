import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { blogsApi } from "../api/blogs";
import type { Blog } from "../types";
import { CoverImageControl } from "./cover-image-control";

vi.mock("next/image", () => ({ default: "img" }));
vi.mock("../api/blogs", () => ({ blogsApi: { uploadCover: vi.fn(), deleteCover: vi.fn() } }));
const blog: Blog = { id: "1", slug: "post", title: "Post", seo_title: "SEO", meta_description: "Meta", author: "Vyntics", category: "Engineering", excerpt: "Excerpt", cover_image_url: null, read_time: 4, content: {}, is_featured: false, status: "draft", published_at: null, created_at: "2026-09-28T00:00:00Z", updated_at: "2026-09-28T00:00:00Z" };

describe("CoverImageControl", () => {
  beforeEach(() => vi.clearAllMocks());
  it("uploads a validated image and reports provider failure safely", async () => {
    const changed = vi.fn();
    vi.mocked(blogsApi.uploadCover).mockResolvedValue({ ...blog, cover_image_url: "https://example.com/new.jpg" });
    const { rerender } = render(<CoverImageControl blog={blog} onChanged={changed} />);
    fireEvent.change(screen.getByLabelText("Choose Blog cover image"), { target: { files: [new File(["jpeg"], "cover.jpg", { type: "image/jpeg" })] } });
    await waitFor(() => expect(changed).toHaveBeenCalled());
    vi.mocked(blogsApi.uploadCover).mockRejectedValue(new ApiError({ kind: "service_unavailable", message: "provider details" }));
    rerender(<CoverImageControl blog={blog} onChanged={changed} />);
    fireEvent.change(screen.getByLabelText("Choose Blog cover image"), { target: { files: [new File(["jpeg"], "cover.jpg", { type: "image/jpeg" })] } });
    expect(await screen.findByText(/temporarily unavailable/)).toBeInTheDocument();
    expect(screen.queryByText("provider details")).not.toBeInTheDocument();
  });
  it("replaces and deletes an existing cover, but prevents published removal", async () => {
    const covered = { ...blog, cover_image_url: "https://example.com/cover.jpg" };
    vi.mocked(blogsApi.deleteCover).mockResolvedValue(undefined);
    const changed = vi.fn();
    const { rerender } = render(<CoverImageControl blog={covered} onChanged={changed} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove cover" }));
    await waitFor(() => expect(blogsApi.deleteCover).toHaveBeenCalledWith("1"));
    rerender(<CoverImageControl blog={{ ...covered, status: "published" }} onChanged={changed} />);
    expect(screen.getByRole("button", { name: "Remove cover" })).toBeDisabled();
    expect(screen.getByText(/Unpublish this Blog/)).toBeInTheDocument();
  });
  it("rejects unsupported and oversized files before upload", () => {
    render(<CoverImageControl blog={blog} onChanged={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Choose Blog cover image"), { target: { files: [new File(["gif"], "cover.gif", { type: "image/gif" })] } });
    expect(screen.getByText("Choose a JPEG, PNG, or WebP image.")).toBeInTheDocument();
    expect(blogsApi.uploadCover).not.toHaveBeenCalled();
  });
});
