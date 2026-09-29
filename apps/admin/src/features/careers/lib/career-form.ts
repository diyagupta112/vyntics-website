import type { ApiError } from "@/lib/api/errors";

import type {
  Career,
  CareerCreateRequest,
  CareerUpdateRequest,
} from "../types";

export type CareerFormValues = {
  title: string;
  slug: string;
  location: string;
  employmentType: string;
  department: string;
  experience: string;
  shortDescription: string;
  description: string;
  responsibilities: string;
  requirements: string;
  niceToHave: string;
  benefits: string;
};

export type CareerFormErrors = Partial<Record<keyof CareerFormValues, string>>;

const emptyObject = "{}";

export const emptyCareerForm: CareerFormValues = {
  title: "",
  slug: "",
  location: "",
  employmentType: "",
  department: "",
  experience: "",
  shortDescription: "",
  description: emptyObject,
  responsibilities: emptyObject,
  requirements: emptyObject,
  niceToHave: emptyObject,
  benefits: emptyObject,
};

export function careerToForm(career: Career): CareerFormValues {
  return {
    title: career.title,
    slug: career.slug,
    location: career.location,
    employmentType: career.employment_type,
    department: career.department,
    experience: career.experience,
    shortDescription: career.short_description,
    description: JSON.stringify(career.description, null, 2),
    responsibilities: JSON.stringify(career.responsibilities, null, 2),
    requirements: JSON.stringify(career.requirements, null, 2),
    niceToHave: JSON.stringify(career.nice_to_have, null, 2),
    benefits: JSON.stringify(career.benefits, null, 2),
  };
}

const textFields: Array<[keyof CareerFormValues, string]> = [
  ["title", "Title"],
  ["slug", "Slug"],
  ["location", "Location"],
  ["employmentType", "Employment type"],
  ["department", "Department"],
  ["experience", "Experience"],
  ["shortDescription", "Short description"],
];

const objectFields: Array<[keyof CareerFormValues, string]> = [
  ["description", "Description"],
  ["responsibilities", "Responsibilities"],
  ["requirements", "Requirements"],
  ["niceToHave", "Nice to have"],
  ["benefits", "Benefits"],
];

function parseObject(value: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Expected a JSON object");
  }
  return parsed as Record<string, unknown>;
}

export function validateCareerForm(
  values: CareerFormValues,
): CareerFormErrors {
  const errors: CareerFormErrors = {};

  for (const [field, label] of textFields) {
    if (!values[field].trim()) errors[field] = `${label} is required.`;
  }

  for (const [field, label] of objectFields) {
    try {
      parseObject(values[field]);
    } catch {
      errors[field] = `${label} must be a valid JSON object.`;
    }
  }

  return errors;
}

function payload(values: CareerFormValues): CareerCreateRequest {
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    location: values.location.trim(),
    employment_type: values.employmentType.trim(),
    department: values.department.trim(),
    experience: values.experience.trim(),
    short_description: values.shortDescription.trim(),
    description: parseObject(values.description),
    responsibilities: parseObject(values.responsibilities),
    requirements: parseObject(values.requirements),
    nice_to_have: parseObject(values.niceToHave),
    benefits: parseObject(values.benefits),
  };
}

export function toCreateRequest(
  values: CareerFormValues,
): CareerCreateRequest {
  return payload(values);
}

export function toUpdateRequest(
  values: CareerFormValues,
): CareerUpdateRequest {
  return payload(values);
}

const fieldMap: Record<string, keyof CareerFormValues> = {
  title: "title",
  slug: "slug",
  location: "location",
  employment_type: "employmentType",
  department: "department",
  experience: "experience",
  short_description: "shortDescription",
  description: "description",
  responsibilities: "responsibilities",
  requirements: "requirements",
  nice_to_have: "niceToHave",
  benefits: "benefits",
};

export function backendFieldErrors(error: ApiError): CareerFormErrors {
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
