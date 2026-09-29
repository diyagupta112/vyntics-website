import type { ApiError } from "@/lib/api/errors";

import type {
  CaseStudy,
  CaseStudyCreateRequest,
  CaseStudyStatus,
  CaseStudyUpdateRequest,
} from "../types";

export type CaseStudyFormValues = {
  title: string;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  clientName: string;
  excerpt: string;
  techStack: string;
  tags: string;
  content: string;
  status: CaseStudyStatus;
};

export type CaseStudyFormErrors = Partial<
  Record<keyof CaseStudyFormValues, string>
>;

export const emptyCaseStudyForm: CaseStudyFormValues = {
  title: "",
  slug: "",
  seoTitle: "",
  metaDescription: "",
  clientName: "",
  excerpt: "",
  techStack: "",
  tags: "",
  content: '{\n  "type": "doc",\n  "content": []\n}',
  status: "draft",
};

export function caseStudyToForm(caseStudy: CaseStudy): CaseStudyFormValues {
  return {
    title: caseStudy.title,
    slug: caseStudy.slug,
    seoTitle: caseStudy.seo_title,
    metaDescription: caseStudy.meta_description,
    clientName: caseStudy.client_name,
    excerpt: caseStudy.excerpt,
    techStack: caseStudy.tech_stack.join(", "),
    tags: caseStudy.tags.join(", "),
    content: JSON.stringify(caseStudy.content, null, 2),
    status: caseStudy.status,
  };
}

export function parseList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function validateCaseStudyForm(
  values: CaseStudyFormValues,
): CaseStudyFormErrors {
  const errors: CaseStudyFormErrors = {};
  const required: Array<[keyof CaseStudyFormValues, string]> = [
    ["title", "Title"],
    ["slug", "Slug"],
    ["seoTitle", "SEO title"],
    ["metaDescription", "Meta description"],
    ["clientName", "Client name"],
    ["excerpt", "Excerpt"],
  ];

  for (const [field, label] of required) {
    if (!values[field].trim()) errors[field] = `${label} is required.`;
  }

  try {
    const parsed: unknown = JSON.parse(values.content);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      errors.content = "Content must be a JSON object.";
    }
  } catch {
    errors.content = "Content must be valid JSON.";
  }

  return errors;
}

function contentObject(content: string): Record<string, unknown> {
  return JSON.parse(content) as Record<string, unknown>;
}

function commonPayload(values: CaseStudyFormValues) {
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    seo_title: values.seoTitle.trim(),
    meta_description: values.metaDescription.trim(),
    client_name: values.clientName.trim(),
    excerpt: values.excerpt.trim(),
    tech_stack: parseList(values.techStack),
    tags: parseList(values.tags),
    content: contentObject(values.content),
  };
}

export function toCreateRequest(
  values: CaseStudyFormValues,
): CaseStudyCreateRequest {
  if (values.status === "published") {
    throw new Error(
      "A new Case Study cannot be published before its cover is uploaded.",
    );
  }
  return {
    ...commonPayload(values),
    cover_image_url: null,
    status: values.status,
  };
}

export function toUpdateRequest(
  values: CaseStudyFormValues,
): CaseStudyUpdateRequest {
  return { ...commonPayload(values), status: values.status };
}

const fieldMap: Record<string, keyof CaseStudyFormValues> = {
  title: "title",
  slug: "slug",
  seo_title: "seoTitle",
  meta_description: "metaDescription",
  client_name: "clientName",
  excerpt: "excerpt",
  tech_stack: "techStack",
  tags: "tags",
  content: "content",
  status: "status",
};

export function backendFieldErrors(error: ApiError): CaseStudyFormErrors {
  return Object.fromEntries(
    error.validationIssues.flatMap((issue) => {
      const backendField = [...issue.location]
        .reverse()
        .find((part) => typeof part === "string");
      const field =
        typeof backendField === "string" ? fieldMap[backendField] : undefined;
      return field ? [[field, issue.message]] : [];
    }),
  );
}
