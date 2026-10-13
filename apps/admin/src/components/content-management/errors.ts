import { isApiError, type ApiError } from "@/lib/api/errors";

export function contentErrorMessage(error: unknown, resource: string, action: string) {
  if (!isApiError(error)) return `We could not ${action}. Please try again.`;
  switch (error.kind) {
    case "authentication": return "Your session has expired. Sign in again to continue.";
    case "permission": return `You do not have permission to manage ${resource}.`;
    case "not_found": return "This record no longer exists.";
    case "validation": return error.message;
    case "service_unavailable": return `We could not ${action} because the service is temporarily unavailable.`;
    case "network": return "The backend could not be reached. Check the connection and try again.";
    default: return `We could not ${action}. Please try again.`;
  }
}

export function contentFieldErrors<T extends string>(error: ApiError, fieldMap: Record<string, T>): Partial<Record<T, string>> {
  return Object.fromEntries(error.validationIssues.flatMap(issue => {
    const backend = [...issue.location].reverse().find(part => typeof part === "string");
    const field = typeof backend === "string" ? fieldMap[backend] : undefined;
    return field ? [[field, issue.message]] : [];
  })) as Partial<Record<T, string>>;
}
