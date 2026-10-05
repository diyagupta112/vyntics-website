import { describe, expect, it } from "vitest";
import { deserializeBlogContent } from "@/components/forms/blog-content";
import { careerSectionToEditor } from "./career-content";

describe("Career rich content adapter", () => {
  it("converts existing items arrays into an editable bullet-list document", () => {
    const document = deserializeBlogContent(careerSectionToEditor({ items: ["Build applications", "Review code"] }));
    expect(document).toMatchObject({
      type: "doc",
      content: [{
        type: "bulletList",
        content: [
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Build applications" }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Review code" }] }] },
        ],
      }],
    });
  });

  it("preserves existing editor documents and gives empty objects a valid empty document", () => {
    const existing = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Existing" }] }] };
    expect(JSON.parse(careerSectionToEditor(existing))).toEqual(existing);
    expect(deserializeBlogContent(careerSectionToEditor({}))).toMatchObject({ type: "doc" });
  });

  it("keeps unsupported objects intact for the shared compatibility guard", () => {
    const legacy = { paragraphs: ["Unknown structure"] };
    expect(JSON.parse(careerSectionToEditor(legacy))).toEqual(legacy);
  });
});
