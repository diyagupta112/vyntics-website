import { isObject, type Content, type Json } from "./snapshot";
export type Media = { type: "video" | "image"; src: string; videoId?: string; poster?: string };
export function safeUrl(value: unknown, allowRelative = false): string | undefined {
  if (typeof value !== "string") return;
  if (allowRelative && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : undefined; } catch { return; }
}
function firstVideo(value: Json): Media | undefined {
  if (Array.isArray(value)) { for (const v of value) { const found = firstVideo(v); if (found) return found; } return; }
  if (!isObject(value)) return;
  const attrs = isObject(value.attrs) ? value.attrs : value;
  if (value.type === "video") {
    if (attrs.provider === "youtube" && typeof attrs.video_id === "string" && /^[A-Za-z0-9_-]{11}$/.test(attrs.video_id)) return { type: "video", src: `https://www.youtube-nocookie.com/embed/${attrs.video_id}`, videoId: attrs.video_id };
    const src = safeUrl(attrs.src ?? attrs.url ?? attrs.image_url ?? attrs.imageUrl ?? value.video_url ?? value.videoUrl);
    if (src) return { type: "video", src, poster: safeUrl(attrs.poster ?? attrs.poster_url ?? attrs.posterUrl) };
  }
  for (const v of Object.values(value)) { const found = firstVideo(v as Json); if (found) return found; }
}
export function heroMedia(content: Content, cover: string | null): Media | undefined {
  return firstVideo(content) ?? (safeUrl(cover, true) ? { type: "image", src: safeUrl(cover, true)! } : undefined);
}
export function bodyWithoutHero(content: Content, media?: Media): Content {
  if (media?.type !== "video") return content;
  function visit(value: Json): Json | undefined {
    if (Array.isArray(value)) return value.flatMap(v => { const result = visit(v); return result === undefined ? [] : [result]; });
    if (!isObject(value)) return value;
    if (value.type === "video" && firstVideo(value as Content)?.src === media?.src) return;
    return Object.fromEntries(Object.entries(value).flatMap(([key, v]) => { const result = visit(v as Json); return result === undefined ? [] : [[key, result]]; })) as Content;
  }
  return (visit(content) ?? {}) as Content;
}
