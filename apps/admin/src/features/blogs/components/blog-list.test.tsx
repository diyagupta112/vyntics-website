import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { blogsApi } from "../api/blogs";
import type { Blog } from "../types";
import { BlogList } from "./blog-list";

vi.mock("../api/blogs", () => ({ blogsApi: { list: vi.fn(), delete: vi.fn() } }));
const blog: Blog = { id: "1", slug: "post", title: "Post", seo_title: "SEO", meta_description: "Meta", author: "Vyntics", category: "Engineering", excerpt: "Excerpt", cover_image_url: null, read_time: 4, content: { type: "doc" }, is_featured: false, status: "draft", published_at: null, created_at: "2026-09-28T00:00:00Z", updated_at: "2026-09-28T00:00:00Z" };

describe("BlogList", () => {
  beforeEach(() => vi.clearAllMocks());
  it("loads and renders Blogs", async () => {
    vi.mocked(blogsApi.list).mockResolvedValue([blog]);
    render(<BlogList />);
    expect(screen.getByRole("status", { name: "Loading Blogs" })).toBeInTheDocument();
    expect(await screen.findByText("Post")).toBeInTheDocument();
    expect(screen.getByText("draft")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.queryByText("Excerpt")).not.toBeInTheDocument();
    expect(screen.queryByText(/min read/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete Post" }).className).toMatch(/destructive/);
  });
  it("renders the empty state", async () => {
    vi.mocked(blogsApi.list).mockResolvedValue([]);
    render(<BlogList />);
    expect(await screen.findByText("No Blog posts yet")).toBeInTheDocument();
  });
  it.each([
    ["authentication", "session has expired"],
    ["permission", "You do not have permission to manage Blogs."],
    ["network", "The backend could not be reached"],
  ] as const)("renders %s errors", async (kind, message) => {
    vi.mocked(blogsApi.list).mockRejectedValue(new ApiError({ kind, message: "safe" }));
    render(<BlogList />);
    expect(await screen.findByText(new RegExp(message))).toBeInTheDocument();
  });
  it("confirms and completes hard deletion", async () => {
    vi.mocked(blogsApi.list).mockResolvedValue([blog]);
    vi.mocked(blogsApi.delete).mockResolvedValue(undefined);
    render(<BlogList />);
    fireEvent.click(await screen.findByRole("button", { name: "Delete Post" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("permanently delete");
    fireEvent.click(screen.getByRole("button", { name: "Delete Permanently" }));
    await waitFor(() => expect(blogsApi.delete).toHaveBeenCalledWith("1"));
    await waitFor(() => expect(screen.queryByText("Post")).not.toBeInTheDocument());
  });
  it("keeps the confirmation open when deletion fails", async () => {
    vi.mocked(blogsApi.list).mockResolvedValue([blog]);
    vi.mocked(blogsApi.delete).mockRejectedValue(new ApiError({ kind: "service_unavailable", message: "safe" }));
    render(<BlogList />);
    fireEvent.click(await screen.findByRole("button", { name: "Delete Post" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Permanently" }));
    expect(await screen.findByText(/temporarily unavailable/)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
