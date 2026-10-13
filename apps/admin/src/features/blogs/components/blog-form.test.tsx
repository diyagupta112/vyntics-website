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
const blog: Blog = { id: "1", slug: "post", title: "Post", seo_title: "SEO", meta_description: "Meta", author: "Vyntics", category: "Engineering", excerpt: "Excerpt", cover_image_url: "https://example.com/cover.jpg", read_time: 4, content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Body" }] }] }, is_featured: false, status: "draft", published_at: null, created_at: "2026-09-28T00:00:00Z", updated_at: "2026-09-28T00:00:00Z" };

describe("BlogForm", () => {
  beforeEach(() => vi.clearAllMocks());
  it("previews current unsaved values without any API mutation", () => {
    render(<BlogForm />);
    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Unsaved preview title" } });
    fireEvent.change(screen.getByLabelText("Related Service"), { target: { value: "all" } });
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    const frame = screen.getByTitle("Blog page preview") as HTMLIFrameElement;
    const instanceId = new URL(frame.src).searchParams.get("instance");
    const post = vi.spyOn(frame.contentWindow!, "postMessage");
    fireEvent(window, new MessageEvent("message", { source: frame.contentWindow, origin: window.location.origin, data: { type: "vyntics-preview/ready", instanceId } }));
    expect(post).toHaveBeenCalledWith(expect.objectContaining({ snapshot: expect.objectContaining({ type: "blog", title: "Unsaved preview title", related_service: "all", is_featured: false }) }), window.location.origin);
    expect(blogsApi.create).not.toHaveBeenCalled();
    expect(blogsApi.update).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Close Preview" }));
    expect(screen.getByLabelText(/^Title/)).toHaveValue("Unsaved preview title");
  });


  it.each([false, true])("loads featured=%s and sends its changed value on edit", async (featured) => {
    vi.mocked(blogsApi.update).mockResolvedValue({ ...blog, is_featured: !featured });
    render(<BlogForm blog={{ ...blog, is_featured: featured }} />);
    const checkbox = screen.getByRole("checkbox", { name: "Feature this blog on the website" });
    expect(checkbox).toHaveProperty("checked", featured);
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(blogsApi.update).toHaveBeenCalledWith("1", expect.objectContaining({ is_featured: !featured })));
  });

  it("displays the backend featured limit and preserves form state", async () => {
    const message = "Maximum of 5 featured blogs allowed.";
    vi.mocked(blogsApi.update).mockRejectedValue(new ApiError({ kind: "validation", status: 422, message }));
    render(<BlogForm blog={blog} />);
    const checkbox = screen.getByRole("checkbox", { name: "Feature this blog on the website" });
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(checkbox).toBeChecked();
    expect(screen.getByLabelText(/^Title/)).toHaveValue(blog.title);
  });

  it("validates required create fields", () => {
    render(<BlogForm />);
    fireEvent.click(screen.getByRole("button", { name: "Create Blog" }));
    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    expect(blogsApi.create).not.toHaveBeenCalled();
  });
  it.each([[false, ""], [true, ""], [false, "cloud_foundations"], [false, "data_engineering"], [false, "analytics_bi"], [false, "ai_solutions"], [false, "crm_revenue_ops"], [true, "all"]] as const)("creates with is_featured=%s and moves to edit", async (featured, target) => {
    vi.mocked(blogsApi.create).mockResolvedValue(blog);
    render(<BlogForm />);
    const values: Record<string, string> = { title: "Post", slug: "post", author: "Vyntics", category: "Engineering", readTime: "4", excerpt: "Excerpt", seoTitle: "SEO", metaDescription: "Meta", content: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Body" }] }] }) };
    for (const [id, value] of Object.entries(values)) fireEvent.change(document.getElementById(id)!, { target: { value } });
    const checkbox = screen.getByRole("checkbox", { name: "Feature this blog on the website" });
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    if (!featured) fireEvent.click(checkbox);
    fireEvent.change(screen.getByLabelText("Related Service"), { target: { value: target } });
    fireEvent.click(screen.getByRole("button", { name: "Create Blog" }));
    await waitFor(() => expect(blogsApi.create).toHaveBeenCalled());
    expect(blogsApi.create).toHaveBeenCalledWith(expect.objectContaining({ is_featured: featured }));
    expect(blogsApi.create).toHaveBeenCalledWith(expect.objectContaining({ related_service: target || null }));
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


describe("Content slug and service targeting", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([null, "cloud_foundations", "data_engineering", "analytics_bi", "ai_solutions", "crm_revenue_ops", "all"] as const)("loads and preserves existing service %s during an unrelated edit", async (service) => {
    vi.mocked(blogsApi.update).mockResolvedValue({ ...blog, related_service: service });
    render(<BlogForm blog={{ ...blog, related_service: service }} />);
    expect(screen.getByLabelText("Related Service")).toHaveValue(service ?? "");
    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Updated title" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(blogsApi.update).toHaveBeenCalledWith(blog.id, expect.objectContaining({ related_service: service, slug: blog.slug })));
  });

  it("generates a slug until the admin manually changes it", () => {
    render(<BlogForm />);
    const title = document.getElementById("title")!;
    const slug = document.getElementById("slug")!;
    fireEvent.change(title, { target: { value: "How We Helped ABC" } });
    expect(slug).toHaveValue("how-we-helped-abc");
    fireEvent.change(title, { target: { value: "How We Helped XYZ" } });
    expect(slug).toHaveValue("how-we-helped-xyz");
    fireEvent.change(slug, { target: { value: "custom-public-url" } });
    fireEvent.change(title, { target: { value: "Another title" } });
    expect(slug).toHaveValue("custom-public-url");
  });

  it("keeps an existing slug stable on title edits and allows manual editing", () => {
    render(<BlogForm blog={blog} />);
    const title = document.getElementById("title")!;
    const slug = document.getElementById("slug")!;
    expect(slug).toHaveValue(blog.slug);
    fireEvent.change(title, { target: { value: "Changed title" } });
    expect(slug).toHaveValue(blog.slug);
    fireEvent.change(slug, { target: { value: "changed-manually" } });
    expect(slug).toHaveValue("changed-manually");
  });

  it("defaults to no service and distinguishes All Services", () => {
    render(<BlogForm />);
    const select = screen.getByLabelText("Related Service");
    expect(select).toHaveValue("");
    expect(screen.getByRole("option", { name: "No Related Service" })).toHaveValue("");
    expect(screen.getByRole("option", { name: "All Services" })).toHaveValue("all");
    expect(screen.getAllByRole("option").filter(option => option.closest("select") === select)).toHaveLength(7);
  });

  it.each(["cloud_foundations", "data_engineering", "analytics_bi", "ai_solutions", "crm_revenue_ops", "all", ""] as const)("loads targeting and submits changed target %s on edit", async (target) => {
    vi.mocked(blogsApi.update).mockResolvedValue({ ...blog, related_service: target || null });
    render(<BlogForm blog={{ ...blog, related_service: "data_engineering" }} />);
    const select = screen.getByLabelText("Related Service");
    expect(select).toHaveValue("data_engineering");
    fireEvent.change(select, { target: { value: target } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(blogsApi.update).toHaveBeenCalledWith(blog.id, expect.objectContaining({ related_service: target || null })));
  });
});
