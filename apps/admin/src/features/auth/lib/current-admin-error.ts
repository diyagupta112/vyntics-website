import { ApiError } from "@/lib/api/errors";

export function currentAdminErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Unable to load your account information. Please try again.";
  }

  switch (error.kind) {
    case "authentication":
      return "Your session has expired. Sign in again to continue.";
    case "permission":
      return "Your account information is not available for this session.";
    case "network":
      return "The backend could not be reached. Please try again.";
    case "service_unavailable":
      return "Account information is temporarily unavailable. Please try again later.";
    default:
      return "Unable to load your account information. Please try again.";
  }
}
