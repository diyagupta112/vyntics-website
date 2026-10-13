import type { BlogFormValues } from "@/features/blogs/lib/blog-form";
import { parseList, type CaseStudyFormValues } from "@/features/case-studies/lib/case-study-form";
import { relatedServiceOptions, type RelatedService } from "@/lib/content/related-services";

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
export type Content = { [key: string]: Json };
type Base = {
  title: string; slug: string; excerpt: string; content: Content;
  cover: string | null; status: "draft" | "published" | "unpublished";
  related_service: RelatedService | null; published_at: string | null;
};
export type BlogPreviewSnapshot = Base & { type: "blog"; author: string; category: string; readTime: number | null; is_featured: boolean };
export type CaseStudyPreviewSnapshot = Base & { type: "case-study"; client: string; tags: string[]; techStack: string[]; featured: boolean };
export type PreviewSnapshot = BlogPreviewSnapshot | CaseStudyPreviewSnapshot;
type Saved = { cover_image_url: string | null; published_at: string | null };
export function isObject(value: unknown): value is Record<string, unknown> { return !!value && typeof value === "object" && !Array.isArray(value); }
function isJson(value: unknown, depth = 0): value is Json {
  if (depth > 50) return false;
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(v => isJson(v, depth + 1));
  return isObject(value) && Object.values(value).every(v => isJson(v, depth + 1));
}
function content(value: string): Content {
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { throw new Error("Content contains invalid JSON. Correct it before opening Preview."); }
  if (!isObject(parsed) || !isJson(parsed)) throw new Error("Preview content must be a valid structured object.");
  return parsed as Content;
}
function freeze<T>(value: T): T {
  if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function base(values: BlogFormValues | CaseStudyFormValues, saved?: Saved): Base {
  return { title: values.title, slug: values.slug, excerpt: values.excerpt, content: content(values.content),
    cover: saved?.cover_image_url ?? null, published_at: values.status === "published" ? saved?.published_at ?? null : null,
    status: values.status, related_service: values.relatedService || null };
}
export function blogSnapshot(values: BlogFormValues, saved?: Saved): BlogPreviewSnapshot {
  const readTime = values.readTime.trim() ? Number(values.readTime) : NaN;
  return freeze({ ...base(values, saved), type: "blog", author: values.author, category: values.category,
    readTime: Number.isFinite(readTime) ? readTime : null, is_featured: values.isFeatured });
}
export function caseStudySnapshot(values: CaseStudyFormValues, saved?: Saved): CaseStudyPreviewSnapshot {
  return freeze({ ...base(values, saved), type: "case-study", client: values.clientName, tags: parseList(values.tags),
    techStack: parseList(values.techStack), featured: values.isFeatured });
}
export function validSnapshot(value: unknown): value is PreviewSnapshot {
  if (!isObject(value) || !["blog", "case-study"].includes(String(value.type))) return false;
  if (![value.title, value.slug, value.excerpt].every(v => typeof v === "string")) return false;
  if (!(value.cover === null || typeof value.cover === "string") || !["draft", "published", "unpublished"].includes(String(value.status))) return false;
  if (!(value.published_at === null || typeof value.published_at === "string" && Number.isFinite(Date.parse(value.published_at)))) return false;
  if (!(value.related_service === null || relatedServiceOptions.some(o => o.value === value.related_service))) return false;
  if (!isObject(value.content) || !isJson(value.content)) return false;
  if (value.type === "blog") return typeof value.author === "string" && typeof value.category === "string" && typeof value.is_featured === "boolean" && (value.readTime === null || typeof value.readTime === "number" && Number.isFinite(value.readTime));
  return typeof value.client === "string" && typeof value.featured === "boolean" && [value.tags, value.techStack].every(v => Array.isArray(v) && v.every(s => typeof s === "string"));
}
