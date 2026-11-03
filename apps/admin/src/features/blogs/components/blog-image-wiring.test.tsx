import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { blogsApi } from "../api/blogs";
import type { Blog } from "../types";
import { BlogCreateWizard } from "./blog-create-wizard";
import { BlogForm } from "./blog-form";

const push = vi.fn();
vi.mock("next/image", () => ({ default: "img" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../api/blogs", () => ({ blogsApi: { create: vi.fn(), update: vi.fn(), uploadCover: vi.fn(), deleteCover: vi.fn(), uploadContentImage: vi.fn() } }));
// Exposes how the form wires the real editor's Image action without rendering ProseMirror.
vi.mock("@/components/forms/rich-text-editor", () => ({
  RichTextEditor: ({ id, value, onChange, imageUpload }: { id: string; value: string; onChange: (value: string) => void; imageUpload?: ((file: File) => Promise<unknown>) | null }) => (
    <div>
      <textarea aria-label="Blog content editor" id={id} onChange={(event) => onChange(event.target.value)} value={value} />
      <button disabled={imageUpload === null} onClick={() => void imageUpload?.(new File(["x"], "a.png", { type: "image/png" }))} type="button">Image</button>
    </div>
  ),
}));

const blog: Blog = { related_services: [], related_sub_services: [], id: "blog-1", slug: "post", title: "Post", seo_title: "SEO", meta_description: "Meta", author: "Vyntics", category: "Engineering", excerpt: "Excerpt", cover_image_url: null, read_time: 4, content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Body" }] }] }, is_featured: false, status: "draft", published_at: null, created_at: "2026-09-28T00:00:00Z", updated_at: "2026-09-28T00:00:00Z" };

function fillBlog() {
  const values: Record<string, string> = { title: "Post", slug: "post", author: "Vyntics", category: "Engineering", readTime: "4", excerpt: "Excerpt", seoTitle: "SEO", metaDescription: "Meta", content: JSON.stringify(blog.content) };
  for (const [id, value] of Object.entries(values)) fireEvent.change(document.getElementById(id)!, { target: { value } });
}

describe("Blog body image availability", () => {
  beforeEach(() => vi.clearAllMocks());
  it("is unavailable on a new Blog and uses the saved ID on an existing one", async () => {
    const { unmount } = render(<BlogForm />);
    expect(screen.getByRole("button", { name: "Image" })).toBeDisabled();
    unmount();
    vi.mocked(blogsApi.uploadContentImage).mockResolvedValue({ url: "u", content_type: "image/png", size_bytes: 1 });
    render(<BlogForm blog={blog} />);
    expect(screen.getByRole("button", { name: "Image" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Image" }));
    await waitFor(() => expect(blogsApi.uploadContentImage).toHaveBeenCalledWith("blog-1", expect.any(File)));
  });
  it("becomes enabled with the created ID after Back, without creating a duplicate", async () => {
    vi.mocked(blogsApi.create).mockResolvedValue(blog);
    vi.mocked(blogsApi.update).mockResolvedValue(blog);
    vi.mocked(blogsApi.uploadContentImage).mockResolvedValue({ url: "u", content_type: "image/png", size_bytes: 1 });
    render(<BlogCreateWizard />);
    expect(screen.getByRole("button", { name: "Image" })).toBeDisabled();
    fillBlog();
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    await screen.findByRole("heading", { name: "Add Cover Image" });
    fireEvent.click(screen.getByRole("button", { name: "← Back" }));
    expect(screen.getByRole("button", { name: "Image" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Image" }));
    await waitFor(() => expect(blogsApi.uploadContentImage).toHaveBeenCalledWith("blog-1", expect.any(File)));
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    await waitFor(() => expect(blogsApi.update).toHaveBeenCalledTimes(1));
    expect(blogsApi.create).toHaveBeenCalledTimes(1);
  });
});
