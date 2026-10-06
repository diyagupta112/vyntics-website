import { describe, expect, it } from "vitest";
import { youtubeVideoId } from "./youtube-video";
import { deserializeBlogContent, isBlogContentEmpty, serializeBlogContent } from "./blog-content";

const id = "dQw4w9WgXcQ";
const block = { type: "video", attrs: { provider: "youtube", video_id: id } };

describe("YouTube content contract", () => {
  it.each([
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}?t=30`,
    `https://www.youtube.com/embed/${id}`,
    `https://m.youtube.com/watch?feature=share&v=${id}`,
    `https://youtube.com/shorts/${id}/`,
    ` http://www.youtube.com/watch?v=${id} `,
  ])("normalizes %s to an ID", (url) => { expect(youtubeVideoId(url)).toBe(id); });

  it.each([
    "", "javascript:alert(1)", "data:text/html,hello", "https://example.com/watch?v=" + id,
    `<iframe src="https://youtube.com/embed/${id}"></iframe>`,
    "https://youtube.com.evil.test/watch?v=" + id, "https://evil.youtube.com/watch?v=" + id,
    "https://user@youtube.com/watch?v=" + id, "https://youtube.com:9999/watch?v=" + id,
    "https://youtube.com/watch", "https://youtu.be/abc", `https://youtu.be/${id}/extra`,
    `https://youtube.com/watch?v=${id}&v=${id}`, "https://www.you\ntube.com/watch?v=" + id,
  ])("rejects unsafe or malformed input %s", (url) => { expect(() => youtubeVideoId(url)).toThrow(); });

  it("preserves canonical video blocks and text through a round trip", () => {
    const content = { type: "doc", content: [
      { type: "paragraph", content: [{ type: "text", text: "Before" }] },
      block,
      { type: "paragraph", content: [{ type: "text", text: "After" }] },
    ] };
    expect(JSON.parse(serializeBlogContent(deserializeBlogContent(content)))).toEqual(content);
    expect(isBlogContentEmpty(deserializeBlogContent({ type: "doc", content: [block] }))).toBe(false);
  });

  it("normalizes backend-supported URL attributes without storing presentation properties", () => {
    const doc = deserializeBlogContent({ type: "doc", content: [{ type: "video", attrs: { provider: "youtube", url: `https://youtu.be/${id}` } }] });
    expect(doc.content).toEqual([block]);
  });

  it.each([
    { type: "video", provider: "youtube", video_id: id },
    { type: "video", attrs: { provider: "vimeo", video_id: id } },
    { type: "video", attrs: { provider: "youtube", video_id: "bad" } },
    { ...block, content: [] },
    { type: "video", attrs: { ...block.attrs, autoplay: true } },
  ])("blocks invalid video content instead of silently losing it", (video) => {
    expect(() => deserializeBlogContent({ type: "doc", content: [video] })).toThrow();
  });
});
