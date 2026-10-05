import type { ApiError } from "@/lib/api/errors";
import type { Badge, BadgeCreateRequest, BadgeUpdateRequest } from "../types";

export type BadgeFormValues = { name: string; description: string; websiteUrl: string; displayOrder: string; isActive: "true" | "false" };
export type BadgeFormErrors = Partial<Record<keyof BadgeFormValues, string>>;
export const emptyBadgeForm: BadgeFormValues = { name: "", description: "", websiteUrl: "", displayOrder: "0", isActive: "true" };

export function badgeToForm(badge: Badge): BadgeFormValues {
  return { name: badge.name, description: badge.description ?? "", websiteUrl: badge.website_url ?? "", displayOrder: String(badge.display_order), isActive: badge.is_active ? "true" : "false" };
}

export function validateBadgeForm(values: BadgeFormValues): BadgeFormErrors {
  const errors: BadgeFormErrors = {};
  const name = values.name.trim();
  const description = values.description.trim();
  const website = values.websiteUrl.trim();
  if (!name) errors.name = "Name is required.";
  else if (name.length > 200) errors.name = "Name must be 200 characters or fewer.";
  if (description.length > 1000) errors.description = "Description must be 1,000 characters or fewer.";
  if (!Number.isInteger(Number(values.displayOrder))) errors.displayOrder = "Display order must be a whole number.";
  if (website) {
    try {
      const url = new URL(website);
      if (!["http:", "https:"].includes(url.protocol) || website.length > 2048) throw new Error();
    } catch { errors.websiteUrl = "Enter a valid HTTP or HTTPS URL."; }
  }
  return errors;
}

function payload(values: BadgeFormValues): BadgeCreateRequest {
  return { name: values.name.trim(), description: values.description.trim() || null, website_url: values.websiteUrl.trim() || null, display_order: Number(values.displayOrder), is_active: values.isActive === "true" };
}
export function toCreateRequest(values: BadgeFormValues): BadgeCreateRequest { return payload(values); }
export function toUpdateRequest(values: BadgeFormValues): BadgeUpdateRequest { return payload(values); }

const fieldMap: Record<string, keyof BadgeFormValues> = { name: "name", description: "description", website_url: "websiteUrl", display_order: "displayOrder", is_active: "isActive" };
export function backendFieldErrors(error: ApiError): BadgeFormErrors {
  return Object.fromEntries(error.validationIssues.flatMap((issue) => {
    const backend = [...issue.location].reverse().find((part) => typeof part === "string");
    const field = typeof backend === "string" ? fieldMap[backend] : undefined;
    return field ? [[field, issue.message]] : [];
  }));
}
