import { isApiError } from "@/lib/api/errors";

export function blogErrorMessage(error: unknown, action = "load Blogs"): string {
  if (!isApiError(error)) return `We could not ${action}. Please try again.`;
  switch (error.kind) {
    case "authentication": return "Your session has expired. Sign in again to continue.";
    case "permission": return "You do not have permission to manage Blogs.";
    case "not_found": return "This Blog no longer exists.";
    case "conflict": return "That slug is already used by another Blog.";
    case "validation": return error.message;
    case "service_unavailable": return `We could not ${action} because the service is temporarily unavailable.`;
    case "network": return "The backend could not be reached. Check the connection and try again.";
    default: return `We could not ${action}. Please try again.`;
  }
}
