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
const blog: Blog = { related_services: [], related_sub_services: [], id: "1", slug: "post", title: "Post", seo_title: "SEO", meta_description: "Meta", author: "Vyntics", category: "Engineering", excerpt: "Excerpt", cover_image_url: "https://example.com/cover.jpg", read_time: 4, content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Body" }] }] }, is_featured: false, status: "draft", published_at: null, created_at: "2026-09-28T00:00:00Z", updated_at: "2026-09-28T00:00:00Z" };

describe("BlogForm", () => {
  beforeEach(() => vi.clearAllMocks());
  it("previews current unsaved values without any API mutation", () => {
    render(<BlogForm />);
    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Unsaved preview title" } });
    fireEvent.click(screen.getByLabelText("Cloud Foundations"));
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    const frame = screen.getByTitle("Blog page preview") as HTMLIFrameElement;
    const instanceId = new URL(frame.src).searchParams.get("instance");
    const post = vi.spyOn(frame.contentWindow!, "postMessage");
    fireEvent(window, new MessageEvent("message", { source: frame.contentWindow, origin: window.location.origin, data: { type: "vyntics-preview/ready", instanceId } }));
    expect(post).toHaveBeenCalledWith(expect.objectContaining({ snapshot: expect.objectContaining({ type: "blog", title: "Unsaved preview title", related_services: ["cloud_foundations"], is_featured: false }) }), window.location.origin);
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
  it.each([[false, []], [true, []], [false, ["cloud_foundations"]], [false, ["cloud_foundations", "data_engineering"]], [true, ["ai_solutions", "crm_revenue_ops", "analytics_bi"]]] as const)("creates with is_featured=%s and moves to edit", async (featured, target) => {
    vi.mocked(blogsApi.create).mockResolvedValue(blog);
    render(<BlogForm />);
    const values: Record<string, string> = { title: "Post", slug: "post", author: "Vyntics", category: "Engineering", readTime: "4", excerpt: "Excerpt", seoTitle: "SEO", metaDescription: "Meta", content: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Body" }] }] }) };
    for (const [id, value] of Object.entries(values)) fireEvent.change(document.getElementById(id)!, { target: { value } });
    const checkbox = screen.getByRole("checkbox", { name: "Feature this blog on the website" });
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    if (!featured) fireEvent.click(checkbox);
    for (const service of target) fireEvent.click(document.getElementById(`blog-service-${service}`)!);
    fireEvent.click(screen.getByRole("button", { name: "Create Blog" }));
    await waitFor(() => expect(blogsApi.create).toHaveBeenCalled());
    expect(blogsApi.create).toHaveBeenCalledWith(expect.objectContaining({ is_featured: featured }));
    expect(blogsApi.create).toHaveBeenCalledWith(expect.objectContaining({ related_services: target, related_sub_services: [] }));
    expect(vi.mocked(blogsApi.create).mock.calls[0]![0]).not.toHaveProperty("related_service");
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

  it("defaults to no targeting and does not offer All Services", () => {
    render(<BlogForm />);
    expect(screen.getAllByRole("checkbox").filter((box) => box.id.startsWith("blog-service-"))).toHaveLength(5);
    expect(screen.queryByLabelText("All Services")).not.toBeInTheDocument();
    expect(screen.getByText("No sub-services selected.")).toBeInTheDocument();
  });

  it("hydrates existing services and sub-services, including unknown keys", () => {
    render(<BlogForm blog={{ ...blog, related_services: ["cloud_foundations", "data_engineering"], related_sub_services: ["cloud_cost_optimization", "legacy_custom_key"] }} />);
    expect(screen.getByLabelText("Cloud Foundations")).toBeChecked();
    expect(screen.getByLabelText("Data Engineering")).toBeChecked();
    expect(screen.getByLabelText("Analytics & BI")).not.toBeChecked();
    expect(screen.getByLabelText("Cloud Cost Optimization")).toBeChecked();
    expect(screen.getByRole("button", { name: "Remove Legacy Custom Key" })).toBeInTheDocument();
  });

  it("shows only the selected services' sub-services and keeps selected ones", () => {
    render(<BlogForm />);
    expect(screen.getByLabelText("AI Agents")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Analytics & BI"));
    expect(screen.queryByLabelText("AI Agents")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("BI Consulting"));
    fireEvent.click(screen.getByLabelText("Analytics & BI"));
    fireEvent.click(screen.getByLabelText("AI Solutions"));
    expect(screen.getByLabelText("BI Consulting")).toBeChecked();
  });

  it("edits selections, preserves unknown sub-services, and PATCHes arrays only", async () => {
    vi.mocked(blogsApi.update).mockResolvedValue(blog);
    render(<BlogForm blog={{ ...blog, related_services: ["data_engineering"], related_sub_services: ["legacy_custom_key"] }} />);
    fireEvent.click(screen.getByLabelText("Cloud Foundations"));
    fireEvent.click(screen.getByLabelText("Cloud Cost Optimization"));
    fireEvent.click(screen.getByRole("button", { name: "Remove Data Engineering" }));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(blogsApi.update).toHaveBeenCalled());
    const payload = vi.mocked(blogsApi.update).mock.calls[0]![1];
    expect(payload).toMatchObject({ related_services: ["cloud_foundations"], related_sub_services: ["legacy_custom_key", "cloud_cost_optimization"] });
    expect(payload).not.toHaveProperty("related_service");
  });

  it("sends empty arrays when all selections are cleared", async () => {
    vi.mocked(blogsApi.update).mockResolvedValue(blog);
    render(<BlogForm blog={{ ...blog, related_services: ["ai_solutions"], related_sub_services: ["ai_agents"] }} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove AI Solutions" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove AI Agents" }));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(blogsApi.update).toHaveBeenCalled());
    expect(vi.mocked(blogsApi.update).mock.calls[0]![1]).toMatchObject({ related_services: [], related_sub_services: [] });
  });

  it("shows backend 422 targeting errors without resubmitting", async () => {
    vi.mocked(blogsApi.update).mockRejectedValue(new ApiError({ kind: "validation", status: 422, message: "Invalid input.", validationIssues: [{ location: ["body", "related_services", 0], message: "Unsupported service.", type: "value_error" }] }));
    render(<BlogForm blog={{ ...blog, related_services: ["cloud_foundations"] }} />);
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText("Unsupported service.")).toBeInTheDocument();
    expect(blogsApi.update).toHaveBeenCalledTimes(1);
  });
});
