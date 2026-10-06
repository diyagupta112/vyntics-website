export const YOUTUBE_VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export function youtubeVideoId(value: string): string {
  const input = value.trim();
  if (!input) throw new Error("Enter a YouTube video URL.");
  const invalid = "Enter a valid YouTube watch, youtu.be, embed, or Shorts URL.";
  if (!/^https?:\/\//i.test(input) || input.includes("\\") || /[\s\x00-\x1f\x7f]/.test(input)) throw new Error(invalid);
  let url: URL;
  try { url = new URL(input); } catch { throw new Error(invalid); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.port) throw new Error(invalid);
  const path = url.pathname.replace(/\/+$/, "");
  const parts = path.split("/");
  let id: string | undefined;
  if (["youtu.be", "www.youtu.be"].includes(url.hostname) && parts.length === 2) {
    id = parts[1];
  } else if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
    if (path === "/watch") {
      const ids = url.searchParams.getAll("v");
      if (ids.length === 1) id = ids[0];
    } else if (parts.length === 3 && ["embed", "shorts"].includes(parts[1])) {
      id = parts[2];
    }
  }
  if (!id || !YOUTUBE_VIDEO_ID.test(id)) throw new Error(invalid);
  return id;
}
