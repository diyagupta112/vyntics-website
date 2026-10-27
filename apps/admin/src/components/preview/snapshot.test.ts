import { describe, expect, it } from "vitest";
import { emptyBlogForm } from "@/features/blogs/lib/blog-form";
import { emptyCaseStudyForm } from "@/features/case-studies/lib/case-study-form";
import { blogSnapshot, caseStudySnapshot, validSnapshot } from "./snapshot";
import { heroMedia, bodyWithoutHero } from "./media";
const video = { type: "video", attrs: { provider: "youtube", video_id: "dQw4w9WgXcQ" } };
describe("Preview snapshots", () => {
  it("captures unsaved Blog fields with the existing featured/service convention", () => {
    const snapshot = blogSnapshot({ ...emptyBlogForm, title: "Unsaved", slug: "", excerpt: "New excerpt", author: "New author", category: "AI", readTime: "7", isFeatured: true, relatedServices: ["cloud_foundations"], relatedSubServices: ["cloud_cost_optimization"], content: JSON.stringify({ type: "doc", content: [video] }) }, { cover_image_url: "https://example.com/cover.png", published_at: "2026-10-13T00:00:00Z" });
    expect(snapshot).toMatchObject({ type: "blog", title: "Unsaved", slug: "", excerpt: "New excerpt", author: "New author", category: "AI", readTime: 7, is_featured: true, related_services: ["cloud_foundations"], related_sub_services: ["cloud_cost_optimization"], published_at: null, cover: "https://example.com/cover.png" });
    expect(snapshot).not.toHaveProperty("id");
    expect(snapshot.content.content).toEqual([video]);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.content)).toBe(true);
    expect(validSnapshot(snapshot)).toBe(true);
  });
  it("captures Case Study arrays using the existing parser and featured field", () => {
    const snapshot = caseStudySnapshot({ ...emptyCaseStudyForm, title: "Project", clientName: "Client", excerpt: "Result", tags: "AI, RAG, ,", techStack: "Python, FastAPI", isFeatured: true, relatedServices: ["analytics_bi"] });
    expect(snapshot).toMatchObject({ type: "case-study", title: "Project", client: "Client", excerpt: "Result", tags: ["AI", "RAG"], techStack: ["Python", "FastAPI"], featured: true, related_services: ["analytics_bi"], cover: null, published_at: null });
    expect(snapshot).not.toHaveProperty("is_featured");
    expect(validSnapshot(snapshot)).toBe(true);
  });
  it("uses real published dates and leaves empty metadata optional", () => {
    const saved = { cover_image_url: null, published_at: "2026-10-13T00:00:00Z" };
    expect(blogSnapshot({ ...emptyBlogForm, status: "published" }, saved).published_at).toBe(saved.published_at);
    expect(blogSnapshot(emptyBlogForm).related_services).toEqual([]);
    expect(blogSnapshot(emptyBlogForm).readTime).toBeNull();
  });
  it.each(["not json", "null", "[]"])("rejects malformed content %s", content => {
    expect(() => blogSnapshot({ ...emptyBlogForm, content })).toThrow();
    expect(() => caseStudySnapshot({ ...emptyCaseStudyForm, content })).toThrow();
  });
  it("rejects malformed incoming snapshots", () => {
    const s = blogSnapshot(emptyBlogForm);
    for (const invalid of [null, {}, { ...s, related_services: ["all"] }, { ...s, readTime: NaN }, { ...s, content: [] }, { ...s, published_at: "invalid" }, { ...s, is_featured: "true" }]) expect(validSnapshot(invalid)).toBe(false);
  });
  it("selects the first canonical video, removes matching hero references without mutating input, and retains other videos", () => {
    const second = { type: "video", attrs: { provider: "youtube", video_id: "9bZkp7q19f0" } };
    const content = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Body" }] }, video, second] };
    const media = heroMedia(content, "https://example.com/cover.png");
    expect(media).toMatchObject({ type: "video", videoId: "dQw4w9WgXcQ" });
    expect(bodyWithoutHero(content, media).content).toEqual([content.content[0], second]);
    expect(content.content).toHaveLength(3);
    expect(heroMedia({ type: "doc" }, "https://example.com/cover.png")).toEqual({ type: "image", src: "https://example.com/cover.png" });
    expect(heroMedia({ type: "doc" }, null)).toBeUndefined();
    expect(heroMedia({ type: "doc" }, "javascript:alert(1)")).toBeUndefined();
  });
});
