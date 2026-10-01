export type Blog = { id: string; slug: string; title: string; author: string; category: string; excerpt: string; cover_image_url: string; read_time: number; published_at: string; status?: string };
export async function getBlogs(): Promise<{ status: "success" | "error"; blogs: Blog[] }> {
  try {
    const base = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
    const localPreview = process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname);
    const response = await fetch(`${base}/blogs${localPreview ? "/preview/all" : ""}`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("Request failed");
    const payload = await response.json();
    if (!Array.isArray(payload.data)) throw new Error("Invalid response");
    const blogs: Blog[] = payload.data;
    if (!blogs.every((post) => post && [post.id, post.slug, post.title, post.author, post.category, post.excerpt, post.cover_image_url, post.published_at].every((value) => typeof value === "string") && typeof post.read_time === "number" && Number.isFinite(post.read_time) && Number.isFinite(Date.parse(post.published_at)))) throw new Error("Invalid fields");
    return { status: "success", blogs: blogs.sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at)) };
  } catch { return { status: "error", blogs: [] }; }
}
