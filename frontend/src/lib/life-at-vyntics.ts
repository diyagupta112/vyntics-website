export type LifeAtVyntics = {
  id: string;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

/** A gallery record that can be rendered: the API may return records whose photo has not been uploaded yet. */
export type LifeAtVynticsImage = Pick<LifeAtVyntics, "id" | "display_order"> & { image_url: string };

type LifeAtVynticsResponse = { data: LifeAtVyntics[] };

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isLifeAtVynticsImage(value: unknown): value is LifeAtVynticsImage {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && isHttpUrl(record.image_url) && typeof record.display_order === "number";
}

function apiBaseUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");
}

/** Public gallery images in display order. The endpoint is not paginated, so the gallery reveals them in batches. */
export async function getLifeAtVyntics(): Promise<LifeAtVynticsImage[]> {
  try {
    const response = await fetch(`${apiBaseUrl()}/life-at-vyntics`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return [];

    const payload = (await response.json()) as Partial<LifeAtVynticsResponse>;
    if (!Array.isArray(payload.data)) return [];

    return payload.data
      .filter(isLifeAtVynticsImage)
      .map(({ id, image_url, display_order }) => ({ id, image_url, display_order }))
      .sort((a, b) => a.display_order - b.display_order);
  } catch {
    return [];
  }
}
