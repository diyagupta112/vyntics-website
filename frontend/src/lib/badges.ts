import { cache } from "react";

/** Public /badges contract; tier, recognition date, and logo alt are not exposed. */
export type Badge = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  display_order: number;
};

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isBadge(value: unknown): value is Badge {
  if (!value || typeof value !== "object") return false;
  const badge = value as Record<string, unknown>;
  return typeof badge.id === "string" &&
    typeof badge.name === "string" && badge.name.trim().length > 0 &&
    (badge.description === null || typeof badge.description === "string") &&
    (badge.logo_url === null || isHttpUrl(badge.logo_url)) &&
    (badge.website_url === null || isHttpUrl(badge.website_url)) &&
    typeof badge.display_order === "number" && Number.isFinite(badge.display_order);
}

export const getBadges = cache(async (): Promise<Badge[]> => {
  const base = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
  const response = await fetch(`${base}/badges`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error("The recognitions request failed.");
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !("data" in payload) || !Array.isArray(payload.data) || !payload.data.every(isBadge)) {
    throw new Error("The recognitions response did not match the public contract.");
  }
  // Keep the backend's active-record selection and display ordering intact.
  return payload.data;
});
