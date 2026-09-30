import { htmlToStructuredContent, structuredContentToHtml } from "./rich-text-editor";

describe("RichTextEditor conversion", () => {
  it("loads and saves the existing structured document shape", () => {
    const value = JSON.stringify({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Heading" }] },
        { type: "paragraph", content: [{ type: "text", text: "Bold", marks: [{ type: "bold" }] }] },
      ],
    });
    const html = structuredContentToHtml(value);
    expect(html).toContain("<h2>Heading</h2>");
    expect(html).toContain("<strong>Bold</strong>");

    const container = document.createElement("div");
    container.innerHTML = "<h1>Title</h1><p>Hello <em>world</em></p><ul><li>One</li></ul>";
    expect(JSON.parse(htmlToStructuredContent(container))).toEqual({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Title" }] },
        { type: "paragraph", content: [{ type: "text", text: "Hello " }, { type: "text", text: "world", marks: [{ type: "italic" }] }] },
        { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "One" }] }] }] },
      ],
    });
  });
});
