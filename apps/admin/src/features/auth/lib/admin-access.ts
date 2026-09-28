import { getPublicEnvironment } from "@/lib/config/public-env";

export type AdminAccessFailure = "authentication" | "permission" | "service";

export type AdminAccessResult =
  | { allowed: true }
  | { allowed: false; reason: AdminAccessFailure };

type Fetcher = typeof fetch;

export async function checkAdminAccess(
  accessToken: string,
  fetcher: Fetcher = fetch,
): Promise<AdminAccessResult> {
  const { apiBaseUrl } = getPublicEnvironment();

  try {
    const response = await fetcher(`${apiBaseUrl}/admin/blogs`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (response.ok) {
      return { allowed: true };
    }

    if (response.status === 401) {
      return { allowed: false, reason: "authentication" };
    }

    if (response.status === 403) {
      return { allowed: false, reason: "permission" };
    }

    return { allowed: false, reason: "service" };
  } catch {
    return { allowed: false, reason: "service" };
  }
}

export function getAdminAccessMessage(reason: AdminAccessFailure): string {
  if (reason === "permission") {
    return "You do not have permission to access the Admin Panel.";
  }

  if (reason === "service") {
    return "Authentication is temporarily unavailable. Please try again later.";
  }

  return "Your account is not authorized to access the Admin Panel.";
}
