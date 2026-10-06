import { YOUTUBE_VIDEO_ID, youtubeVideoId } from "./youtube-video";

export type BlogContentNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  content?: BlogContentNode[];
};

export type YouTubeVideoBlock = BlogContentNode & {
  type: "video";
  attrs: { provider: "youtube"; video_id: string };
};

export const EMPTY_BLOG_DOCUMENT: BlogContentNode = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const supportedNodes = new Set([
  "doc", "paragraph", "heading", "text", "bulletList", "orderedList", "listItem", "hardBreak", "video",
]);
const supportedMarks = new Set(["bold", "italic", "link"]);

function normalizeNode(value: unknown, path = "content"): BlogContentNode {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(path + " must be a structured content node.");
  }

  const source = value as Record<string, unknown>;
  if (typeof source.type !== "string" || !supportedNodes.has(source.type)) {
    throw new Error(path + " uses an unsupported content type.");
  }

  if (source.type === "video") {
    const attrs = source.attrs;
    if (Object.keys(source).some((key) => !["type", "attrs"].includes(key)) ||
        !attrs || typeof attrs !== "object" || Array.isArray(attrs)) {
      throw new Error(path + " must be a YouTube video leaf node with type and attrs only.");
    }
    const video = attrs as Record<string, unknown>;
    if (video.provider !== "youtube" || Object.keys(video).some((key) => !["provider", "video_id", "url"].includes(key)) ||
        (video.video_id !== undefined) === (video.url !== undefined)) {
      throw new Error(path + " must contain a YouTube provider and exactly one video reference.");
    }
    const id = video.url !== undefined
      ? youtubeVideoId(typeof video.url === "string" ? video.url : "")
      : video.video_id;
    if (typeof id !== "string" || !YOUTUBE_VIDEO_ID.test(id)) throw new Error(path + " contains an invalid YouTube video ID.");
    const block: YouTubeVideoBlock = { type: "video", attrs: { provider: "youtube", video_id: id } };
    return block;
  }

  const node: BlogContentNode = { type: source.type };
  if (typeof source.text === "string") node.text = source.text;
  if (source.attrs && typeof source.attrs === "object" && !Array.isArray(source.attrs)) {
    node.attrs = { ...(source.attrs as Record<string, unknown>) };
  }
  if (source.marks !== undefined) {
    if (!Array.isArray(source.marks)) throw new Error(path + ".marks must be an array.");
    node.marks = source.marks.map((mark, index) => {
      if (!mark || typeof mark !== "object" || Array.isArray(mark)) {
        throw new Error(path + ".marks[" + index + "] must be a mark.");
      }
      const sourceMark = mark as Record<string, unknown>;
      const type = sourceMark.type === "strong" ? "bold" : sourceMark.type === "em" ? "italic" : sourceMark.type;
      if (typeof type !== "string" || !supportedMarks.has(type)) {
        throw new Error(path + ".marks[" + index + "] uses an unsupported mark.");
      }
      return {
        type,
        ...(sourceMark.attrs && typeof sourceMark.attrs === "object" && !Array.isArray(sourceMark.attrs)
          ? { attrs: { ...(sourceMark.attrs as Record<string, unknown>) } }
          : {}),
      };
    });
  }
  if (source.content !== undefined) {
    if (!Array.isArray(source.content)) throw new Error(path + ".content must be an array.");
    node.content = source.content.map((child, index) => normalizeNode(child, path + ".content[" + index + "]"));
  }
  return node;
}

export function deserializeBlogContent(value: string | Record<string, unknown>): BlogContentNode {
  let parsed: unknown = value;
  if (typeof value === "string") {
    try { parsed = JSON.parse(value); }
    catch { throw new Error("Blog content is not valid structured JSON."); }
  }
  const document = normalizeNode(parsed);
  if (document.type !== "doc") throw new Error("Blog content must have a document root.");
  return document.content?.length ? document : EMPTY_BLOG_DOCUMENT;
}

export function serializeBlogContent(document: BlogContentNode): string {
  return JSON.stringify(normalizeNode(document), null, 2);
}

export function isBlogContentEmpty(document: BlogContentNode): boolean {
  if (document.type === "video") return false;
  if (document.type === "text") return !document.text?.trim();
  return !document.content?.some((node) => !isBlogContentEmpty(node));
}
