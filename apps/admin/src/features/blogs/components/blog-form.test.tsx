import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { blogsApi } from "../api/blogs";
import type { Blog } from "../types";
import { BlogForm } from "./blog-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../api/blogs", () => ({ blogsApi: { create: vi.fn(), update: vi.fn() } }));
vi.mock("@/components/forms/rich-text-editor", () => ({
  RichTextEditor: ({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) => (
    <textarea aria-label="Blog content editor" id={id} onChange={(event) => onChange(event.target.value)} value={value} />
  ),
}));
const blog: Blog = { id: "1", slug: "post", title: "Post", seo_title: "SEO", meta_description: "Meta", author: "Vyntics", category: "Engineering", excerpt: "Excerpt", cover_image_url: "https://example.com/cover.jpg", read_time: 4, content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Body" }] }] }, status: "draft", published_at: null, created_at: "2026-09-28T00:00:00Z", updated_at: "2026-09-28T00:00:00Z" };

describe("BlogForm", () => {
  beforeEach(() => vi.clearAllMocks());
  it("validates required create fields", () => {
    render(<BlogForm />);
    fireEvent.click(screen.getByRole("button", { name: "Create Blog" }));
    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    expect(blogsApi.create).not.toHaveBeenCalled();
  });
  it("submits a successful create and navigates to edit", async () => {
    vi.mocked(blogsApi.create).mockResolvedValue(blog);
    render(<BlogForm />);
    const values: Record<string, string> = { title: "Post", slug: "post", author: "Vyntics", category: "Engineering", readTime: "4", excerpt: "Excerpt", seoTitle: "SEO", metaDescription: "Meta", content: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Body" }] }] }) };
    for (const [id, value] of Object.entries(values)) fireEvent.change(document.getElementById(id)!, { target: { value } });
    fireEvent.click(screen.getByRole("button", { name: "Create Blog" }));
    await waitFor(() => expect(blogsApi.create).toHaveBeenCalled());
    expect(push).toHaveBeenCalledWith("/blogs/1/edit?created=1");
  });
  it.each([
    ["validation", "Backend says invalid"], ["permission", "permission"], ["service_unavailable", "temporarily unavailable"], ["network", "could not be reached"],
  ] as const)("shows safe %s create failures", async (kind, expected) => {
    vi.mocked(blogsApi.update).mockRejectedValue(new ApiError({ kind, message: kind === "validation" ? "Backend says invalid" : "safe" }));
    render(<BlogForm blog={blog} />);
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(blogsApi.update).toHaveBeenCalled());
    expect(await screen.findByText(new RegExp(expected, "i"))).toBeInTheDocument();
  });
  it("populates and successfully updates a Blog including status", async () => {
    vi.mocked(blogsApi.update).mockResolvedValue({ ...blog, status: "published" });
    render(<BlogForm blog={blog} />);
    expect(screen.getByLabelText(/^Title/)).toHaveValue("Post");
    fireEvent.change(screen.getByLabelText(/^Status/), { target: { value: "published" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(blogsApi.update).toHaveBeenCalledWith("1", expect.objectContaining({ status: "published" })));
    expect(await screen.findByText("Blog changes saved.")).toBeInTheDocument();
  });
});
