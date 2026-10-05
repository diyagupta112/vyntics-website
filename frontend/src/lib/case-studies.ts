import { cache } from "react";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export type CaseStudyListItem = {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  excerpt: string;
  cover_image_url: string;
  tech_stack: string[];
  tags: string[];
  featured: boolean;
  published_at: string;
};

export type CaseStudyListResponse = {
  data: CaseStudyListItem[];
};

export type CaseStudyDetailResponse = CaseStudyListItem & {
  seo_title: string;
  meta_description: string;
  content: JsonObject;
};

export type CaseStudyDetail = CaseStudyDetailResponse;

export type CaseStudyMedia = {
  type: "image" | "video";
  src: string;
  alt?: string;
  poster?: string;
};

export class CaseStudyApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "CaseStudyApiError";
    this.status = status;
  }
}

function apiBaseUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isListItem(value: unknown): value is CaseStudyListItem {
  if (!isRecord(value)) return false;
  return (
    ["id", "slug", "title", "client_name", "excerpt", "cover_image_url", "published_at"].every(
      (key) => typeof value[key] === "string",
    ) &&
    typeof value.featured === "boolean" &&
    isStringArray(value.tech_stack) &&
    isStringArray(value.tags)
  );
}

function isDetail(value: unknown): value is CaseStudyDetail {
  if (!isRecord(value) || !isListItem(value)) return false;
  const detail = value as Record<string, unknown>;
  return (
    typeof detail.seo_title === "string" &&
    typeof detail.meta_description === "string" &&
    isRecord(detail.content)
  );
}

async function request(path: string): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl()}${path}`, { cache: "no-store" });
  } catch {
    throw new CaseStudyApiError("The case studies service could not be reached.");
  }

  if (!response.ok) {
    throw new CaseStudyApiError("The case studies request failed.", response.status);
  }

  try {
    return await response.json();
  } catch {
    throw new CaseStudyApiError("The case studies response was not valid JSON.");
  }
}

export const getCaseStudies = cache(async (): Promise<CaseStudyListItem[]> => {
  const payload = await request("/case-studies");
  if (!isRecord(payload) || !Array.isArray(payload.data) || !payload.data.every(isListItem)) {
    throw new CaseStudyApiError("The case studies response did not match the public contract.");
  }
  return payload.data;
});

export const getCaseStudy = cache(async (slug: string): Promise<CaseStudyDetail> => {
  const payload = await request(`/case-studies/${encodeURIComponent(slug)}`);
  if (!isDetail(payload)) {
    throw new CaseStudyApiError("The case study response did not match the public contract.");
  }
  return payload;
});

function safeMediaUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function findMedia(value: JsonValue, wanted: CaseStudyMedia["type"]): CaseStudyMedia | undefined {
  if (Array.isArray(value)) {
    for (const item of value) {
      const media = findMedia(item, wanted);
      if (media) return media;
    }
    return undefined;
  }
  if (!isRecord(value)) return undefined;

  const attrs = isRecord(value.attrs) ? value.attrs : value;
  const type = typeof value.type === "string" ? value.type.toLowerCase() : "";
  const src = safeMediaUrl(
    attrs.src ??
      attrs.url ??
      attrs.image_url ??
      attrs.imageUrl ??
      value.video_url ??
      value.videoUrl,
  );
  if (wanted === "video" && src && (type === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(src))) {
    return {
      type: "video",
      src,
      poster: safeMediaUrl(attrs.poster ?? attrs.poster_url ?? attrs.posterUrl),
    };
  }
  if (wanted === "image" && src && type === "image") {
    return {
      type: "image",
      src,
      alt: typeof attrs.alt === "string" ? attrs.alt : undefined,
    };
  }

  for (const nested of Object.values(value)) {
    const media = findMedia(nested as JsonValue, wanted);
    if (media) return media;
  }
  return undefined;
}

export function getPrimaryMedia(study: CaseStudyDetail): CaseStudyMedia {
  return (
    findMedia(study.content, "video") ??
    findMedia(study.content, "image") ?? {
      type: "image",
      src: study.cover_image_url,
      alt: `${study.title} project cover`,
    }
  );
}

export function uniqueValues(studies: CaseStudyListItem[], key: "tags" | "tech_stack") {
  return [...new Set(studies.flatMap((study) => study[key]).filter(Boolean))];
}
