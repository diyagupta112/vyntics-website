import {
  deserializeBlogContent,
  EMPTY_BLOG_DOCUMENT,
  serializeBlogContent,
  type BlogContentNode,
} from "@/components/forms/blog-content";

function textNode(text: string): BlogContentNode {
  return { type: "text", text };
}

function paragraph(text: string): BlogContentNode {
  return { type: "paragraph", content: [textNode(text)] };
}

function listDocument(items: string[]): BlogContentNode {
  const content = items.map((item) => item.trim()).filter(Boolean).map((item) => ({
    type: "listItem",
    content: [paragraph(item)],
  }));
  return content.length
    ? { type: "doc", content: [{ type: "bulletList", content }] }
    : EMPTY_BLOG_DOCUMENT;
}

export function careerSectionToEditor(value: Record<string, unknown>): string {
  try {
    return serializeBlogContent(deserializeBlogContent(value));
  } catch {
    if (Object.keys(value).length === 0) return serializeBlogContent(EMPTY_BLOG_DOCUMENT);
    if (Array.isArray(value.items) && value.items.every((item) => typeof item === "string")) {
      return serializeBlogContent(listDocument(value.items));
    }
    return JSON.stringify(value, null, 2);
  }
}
