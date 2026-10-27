import type { ApiError } from "@/lib/api/errors";

/** Returns a message when the text is not a positive whole number; blank is allowed when optional. */
export function validateOrder(value: string, optional = false) {
  const text = value.trim();
  if (!text) return optional ? undefined : "Enter a display order.";
  if (!/^\d+$/.test(text) || Number(text) < 1) return "Display order must be a whole number of 1 or more.";
}

export function orderIssue(error: ApiError) {
  return error.validationIssues.find((issue) => issue.location.includes("display_order"))?.message;
}
