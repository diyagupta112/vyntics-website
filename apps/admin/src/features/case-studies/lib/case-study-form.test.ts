import { describe, expect, it } from "vitest";
import {
  emptyCaseStudyForm,
  parseList,
  toCreateRequest,
  validateCaseStudyForm,
} from "./case-study-form";

describe("Case Study form contract", () => {
  it("validates required fields and structured content", () => {
    const errors = validateCaseStudyForm({
      ...emptyCaseStudyForm,
      content: "not json",
    });
    expect(errors.title).toBe("Title is required.");
    expect(errors.clientName).toBe("Client name is required.");
    expect(errors.content).toBe("Content must be valid JSON.");
  });

  it("normalizes comma-separated arrays and exact create fields", () => {
    expect(parseList("Python, FastAPI, , PostgreSQL")).toEqual([
      "Python",
      "FastAPI",
      "PostgreSQL",
    ]);

    const payload = toCreateRequest({
      title: "Platform redesign",
      slug: "platform-redesign",
      seoTitle: "Platform redesign | Vyntics",
      metaDescription: "A platform redesign Case Study.",
      clientName: "Example Client",
      excerpt: "A concise result summary.",
      techStack: "Python, FastAPI",
      tags: "API, Engineering",
      content: '{"type":"doc"}',
      isFeatured: false,
      status: "draft",
    });

    expect(payload).toEqual({
      title: "Platform redesign",
      slug: "platform-redesign",
      seo_title: "Platform redesign | Vyntics",
      meta_description: "A platform redesign Case Study.",
      client_name: "Example Client",
      excerpt: "A concise result summary.",
      cover_image_url: null,
      tech_stack: ["Python", "FastAPI"],
      tags: ["API", "Engineering"],
      content: { type: "doc" },
      featured: false,
      status: "draft",
    });
    expect(payload).not.toHaveProperty("published_at");
  });
});
