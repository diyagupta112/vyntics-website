import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CACHE_TAGS, type PublicCacheTag } from "@/lib/public-cache";

// Also clears cached public API data. Body is optional: {"tags": ["blogs", "team"]}.
// With no body (the existing trigger), every public data tag is cleared.
async function requestedTags(request: Request): Promise<PublicCacheTag[]> {
  const body = await request.json().catch(() => null) as { tags?: unknown } | null;
  if (!body || !Array.isArray(body.tags)) return [...PUBLIC_CACHE_TAGS];
  return PUBLIC_CACHE_TAGS.filter((tag) => (body.tags as unknown[]).includes(tag));
}

export async function POST(request: Request) {
  const secret = process.env.SITEMAP_REVALIDATION_SECRET;
  if (!secret) {
    return Response.json({ error: "Sitemap trigger is not configured." }, { status: 503 });
  }

  const provided = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const tags = await requestedTags(request);
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  revalidatePath("/sitemap.xml");
  return Response.json({ revalidated: true, tags, message: "Cached data cleared. The sitemap will regenerate on its next request." });
}
