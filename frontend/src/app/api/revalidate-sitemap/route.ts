import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";

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

  revalidatePath("/sitemap.xml");
  return Response.json({ revalidated: true, message: "Sitemap will regenerate on its next request." });
}
