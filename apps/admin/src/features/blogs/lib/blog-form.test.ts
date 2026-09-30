import { describe, expect, it } from "vitest";
import { emptyBlogForm, toCreateRequest, validateBlogForm } from "./blog-form";

describe("Blog form contract", () => {
  it("reports required fields and malformed structured content", () => {
    const errors = validateBlogForm({ ...emptyBlogForm, content: "not json" });
    expect(errors.title).toBe("Title is required.");
    expect(errors.content).toBe("Content must be valid JSON.");
  });
  it("constructs only accepted create fields", () => {
    const payload = toCreateRequest({ title: "Post", slug: "post", seoTitle: "Post SEO", metaDescription: "Description", author: "Vyntics", category: "Engineering", excerpt: "Excerpt", readTime: "4", content: '{"type":"doc"}', status: "draft" });
    expect(payload).toEqual({ title: "Post", slug: "post", seo_title: "Post SEO", meta_description: "Description", author: "Vyntics", category: "Engineering", excerpt: "Excerpt", read_time: 4, content: { type: "doc" }, cover_image_url: null, status: "draft" });
    expect(payload).not.toHaveProperty("published_at");
  });
});
