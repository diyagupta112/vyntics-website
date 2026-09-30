import type { ApiError } from "@/lib/api/errors";
import { deserializeBlogContent, isBlogContentEmpty } from "@/components/forms/blog-content";

import type { Blog, BlogCreateRequest, BlogStatus, BlogUpdateRequest } from "../types";

export type BlogFormValues = {
  title: string;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  author: string;
  category: string;
  excerpt: string;
  readTime: string;
  content: string;
  status: BlogStatus;
};

export type BlogFormErrors = Partial<Record<keyof BlogFormValues, string>>;

export const emptyBlogForm: BlogFormValues = {
  title: "",
  slug: "",
  seoTitle: "",
  metaDescription: "",
  author: "",
  category: "",
  excerpt: "",
  readTime: "",
  content: '{\n  "type": "doc",\n  "content": []\n}',
  status: "draft",
};

export function blogToForm(blog: Blog): BlogFormValues {
  return {
    title: blog.title,
    slug: blog.slug,
    seoTitle: blog.seo_title,
    metaDescription: blog.meta_description,
    author: blog.author,
    category: blog.category,
    excerpt: blog.excerpt,
    readTime: String(blog.read_time),
    content: JSON.stringify(blog.content, null, 2),
    status: blog.status,
  };
}

export function validateBlogForm(values: BlogFormValues): BlogFormErrors {
  const errors: BlogFormErrors = {};
  const required: Array<[keyof BlogFormValues, string]> = [
    ["title", "Title"], ["slug", "Slug"], ["seoTitle", "SEO title"],
    ["metaDescription", "Meta description"], ["author", "Author"],
    ["category", "Category"], ["excerpt", "Excerpt"], ["readTime", "Read time"],
  ];

  for (const [field, label] of required) {
    if (!values[field].trim()) errors[field] = `${label} is required.`;
  }

  if (values.readTime.trim() && !Number.isInteger(Number(values.readTime))) {
    errors.readTime = "Read time must be a whole number.";
  }

  try {
    if (isBlogContentEmpty(deserializeBlogContent(values.content))) {
      errors.content = "Content is required.";
    }
  } catch (error) {
    errors.content = error instanceof Error ? error.message : "Content is invalid.";
  }

  return errors;
}

function contentObject(content: string): Record<string, unknown> {
  return JSON.parse(content) as Record<string, unknown>;
}

function commonPayload(values: BlogFormValues) {
  return {
    title: values.title.trim(), slug: values.slug.trim(),
    seo_title: values.seoTitle.trim(), meta_description: values.metaDescription.trim(),
    author: values.author.trim(), category: values.category.trim(),
    excerpt: values.excerpt.trim(), read_time: Number(values.readTime),
    content: contentObject(values.content),
  };
}

export function toCreateRequest(values: BlogFormValues): BlogCreateRequest {
  if (values.status === "published") throw new Error("A new Blog cannot be published before its cover is uploaded.");
  return { ...commonPayload(values), cover_image_url: null, status: values.status };
}

export function toUpdateRequest(values: BlogFormValues): BlogUpdateRequest {
  return { ...commonPayload(values), status: values.status };
}

const fieldMap: Record<string, keyof BlogFormValues> = {
  title: "title", slug: "slug", seo_title: "seoTitle",
  meta_description: "metaDescription", author: "author", category: "category",
  excerpt: "excerpt", read_time: "readTime", content: "content", status: "status",
};

export function backendFieldErrors(error: ApiError): BlogFormErrors {
  return Object.fromEntries(error.validationIssues.flatMap((issue) => {
    const backendField = [...issue.location].reverse().find((part) => typeof part === "string");
    const field = typeof backendField === "string" ? fieldMap[backendField] : undefined;
    return field ? [[field, issue.message]] : [];
  }));
}
