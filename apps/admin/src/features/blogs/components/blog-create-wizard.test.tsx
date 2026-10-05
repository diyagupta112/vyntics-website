import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { blogsApi } from "../api/blogs";
import type { Blog } from "../types";
import { BlogCreateWizard } from "./blog-create-wizard";

const push = vi.fn();
vi.mock("next/image", () => ({ default: "img" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../api/blogs", () => ({ blogsApi: { create: vi.fn(), update: vi.fn(), uploadCover: vi.fn(), deleteCover: vi.fn() } }));
vi.mock("@/components/forms/rich-text-editor", () => ({ RichTextEditor: ({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) => <textarea aria-label="Blog content editor" id={id} onChange={(event) => onChange(event.target.value)} value={value} /> }));

const blog: Blog = { id: "blog-1", slug: "post", title: "Post", seo_title: "SEO", meta_description: "Meta", author: "Vyntics", category: "Engineering", excerpt: "Excerpt", cover_image_url: null, read_time: 4, content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Body" }] }] }, is_featured: false, status: "draft", published_at: null, created_at: "2026-09-28T00:00:00Z", updated_at: "2026-09-28T00:00:00Z" };

function fillBlog() {
  const values: Record<string, string> = { title: "Post", slug: "post", author: "Vyntics", category: "Engineering", readTime: "4", excerpt: "Excerpt", seoTitle: "SEO", metaDescription: "Meta", content: JSON.stringify(blog.content) };
  for (const [id, value] of Object.entries(values)) fireEvent.change(document.getElementById(id)!, { target: { value } });
}

describe("BlogCreateWizard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("validates, creates once, edits after Back, uploads, and finishes", async () => {
    vi.mocked(blogsApi.create).mockResolvedValue({ ...blog, is_featured: true });
    vi.mocked(blogsApi.update).mockResolvedValue({ ...blog, title: "Updated Post" });
    vi.mocked(blogsApi.uploadCover).mockResolvedValue({ ...blog, title: "Updated Post", cover_image_url: "https://example.com/cover.jpg" });
    render(<BlogCreateWizard />);
    expect(screen.getByRole("heading", { name: "Add Blog Content" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    expect(blogsApi.create).not.toHaveBeenCalled();
    fillBlog();
    fireEvent.click(screen.getByRole("checkbox", { name: "Feature this blog on the website" }));
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(await screen.findByRole("heading", { name: "Add Cover Image" })).toBeInTheDocument();
    expect(blogsApi.create).toHaveBeenCalledTimes(1);
    expect(blogsApi.create).toHaveBeenCalledWith(expect.objectContaining({ is_featured: true }));
    fireEvent.click(screen.getByRole("button", { name: "← Back" }));
    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Updated Post" } });
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    await waitFor(() => expect(blogsApi.update).toHaveBeenCalledWith("blog-1", expect.objectContaining({ title: "Updated Post" })));
    expect(blogsApi.create).toHaveBeenCalledTimes(1);
    const file = new File(["image"], "cover.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("Choose Blog cover image"), { target: { files: [file] } });
    await waitFor(() => expect(blogsApi.uploadCover).toHaveBeenCalledWith("blog-1", file));
    fireEvent.click(screen.getByRole("button", { name: "Save & Finish" }));
    expect(push).toHaveBeenCalledWith("/blogs/blog-1/edit?created=1");
  });

  it("stays on the image step when upload fails", async () => {
    vi.mocked(blogsApi.create).mockResolvedValue(blog);
    vi.mocked(blogsApi.uploadCover).mockRejectedValue(new ApiError({ kind: "service_unavailable", message: "safe" }));
    render(<BlogCreateWizard />); fillBlog(); fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    await screen.findByRole("heading", { name: "Add Cover Image" });
    fireEvent.change(screen.getByLabelText("Choose Blog cover image"), { target: { files: [new File(["image"], "cover.jpg", { type: "image/jpeg" })] } });
    expect(await screen.findByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Add Cover Image" })).toBeInTheDocument();
    expect(blogsApi.create).toHaveBeenCalledTimes(1);
  });

  it("keeps Step 1 active and prevents duplicate creation while pending or after failure", async () => {
    let rejectCreate!: (error: unknown) => void;
    vi.mocked(blogsApi.create).mockReturnValue(new Promise((_, reject) => { rejectCreate = reject; }));
    render(<BlogCreateWizard />); fillBlog();
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    const pending = await screen.findByRole("button", { name: "Creating…" });
    expect(pending).toBeDisabled();
    fireEvent.click(pending);
    expect(blogsApi.create).toHaveBeenCalledTimes(1);
    rejectCreate(new ApiError({ kind: "network", message: "safe" }));
    expect(await screen.findByText(/could not be reached/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Add Blog Content" })).toBeInTheDocument();
  });
});
