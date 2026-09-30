import { Editor } from "@tiptap/core";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import {
  deserializeBlogContent,
  isBlogContentEmpty,
  serializeBlogContent,
  type BlogContentNode,
} from "./blog-content";
import { createBlogEditorExtensions, RichTextEditor } from "./rich-text-editor";

function createEditor(content: BlogContentNode) {
  return new Editor({ content, extensions: createBlogEditorExtensions() });
}

describe("Blog rich-text document model", () => {
  it("creates a new paragraph on Enter and continues typing in it", () => {
    const editor = createEditor({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Paragraph one." }] }],
    });
    editor.commands.focus("end");
    editor.commands.enter();
    editor.commands.insertContent("Paragraph two.");

    expect(editor.getJSON()).toMatchObject({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Paragraph one." }] },
        { type: "paragraph", content: [{ type: "text", text: "Paragraph two." }] },
      ],
    });
    expect(editor.state.selection.from).toBe(editor.state.selection.to);
    editor.destroy();
  });

  it.each([1, 2, 3] as const)("changes only the selected block to heading %s", (level) => {
    const editor = createEditor({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "First" }] },
        { type: "paragraph", content: [{ type: "text", text: "Second" }] },
      ],
    });
    editor.commands.setTextSelection(2);
    editor.commands.toggleHeading({ level });

    expect(editor.getJSON().content?.[0]).toMatchObject({ type: "heading", attrs: { level } });
    expect(editor.getJSON().content?.[1]).toMatchObject({ type: "paragraph" });
    editor.destroy();
  });

  it("applies bold and italic only to their selected text", () => {
    const editor = createEditor({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "One two three" }] }],
    });
    editor.commands.setTextSelection({ from: 1, to: 4 });
    editor.commands.toggleBold();
    editor.commands.setTextSelection({ from: 5, to: 8 });
    editor.commands.toggleItalic();

    expect(editor.getJSON().content?.[0]?.content).toEqual([
      { type: "text", marks: [{ type: "bold" }], text: "One" },
      { type: "text", text: " " },
      { type: "text", marks: [{ type: "italic" }], text: "two" },
      { type: "text", text: " three" },
    ]);
    editor.destroy();
  });

  it("creates structured bullet and numbered lists", () => {
    const bullet = createEditor({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Item" }] }],
    });
    bullet.commands.selectAll();
    bullet.commands.toggleBulletList();
    expect(bullet.getJSON().content?.[0]?.type).toBe("bulletList");
    bullet.destroy();

    const ordered = createEditor({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Item" }] }],
    });
    ordered.commands.selectAll();
    ordered.commands.toggleOrderedList();
    expect(ordered.getJSON().content?.[0]?.type).toBe("orderedList");
    ordered.destroy();
  });

  it("creates another list item and exits from an empty item", () => {
    const editor = createEditor({
      type: "doc",
      content: [{
        type: "bulletList",
        content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "First" }] }] }],
      }],
    });
    editor.commands.focus("end");
    editor.commands.enter();
    editor.commands.insertContent("Second");
    editor.commands.enter();
    editor.commands.enter();

    expect(editor.getJSON().content?.[0]?.content).toHaveLength(2);
    expect(editor.getJSON().content?.at(-1)?.type).toBe("paragraph");
    editor.destroy();
  });

  it("preserves links and surrounding text through serialization", () => {
    const editor = createEditor({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Visit Vyntics today" }] }],
    });
    editor.commands.setTextSelection({ from: 7, to: 14 });
    editor.commands.setLink({ href: "https://vyntics.com" });

    const serialized = serializeBlogContent(editor.getJSON() as BlogContentNode);
    const restored = createEditor(deserializeBlogContent(serialized));
    expect(restored.getJSON().content?.[0]?.content?.[1]).toMatchObject({
      type: "text",
      text: "Vyntics",
      marks: [{ type: "link", attrs: { href: "https://vyntics.com" } }],
    });
    editor.destroy();
    restored.destroy();
  });

  it("undoes and redoes document transactions", () => {
    const editor = createEditor({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "First" }] }] });
    editor.commands.focus("end");
    editor.commands.insertContent(" second");
    editor.commands.undo();
    expect(editor.getText()).toBe("First");
    editor.commands.redo();
    expect(editor.getText()).toBe("First second");
    editor.destroy();
  });

  it("normalizes legacy marks, rejects unsupported content, and detects empty documents", () => {
    const legacy = deserializeBlogContent(JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Text", marks: [{ type: "strong" }, { type: "em" }] }] }],
    }));
    expect(legacy.content?.[0]?.content?.[0]?.marks).toEqual([{ type: "bold" }, { type: "italic" }]);
    expect(() => deserializeBlogContent({ type: "doc", content: [{ type: "image" }] })).toThrow(/unsupported content type/i);
    expect(isBlogContentEmpty(deserializeBlogContent({ type: "doc", content: [] }))).toBe(true);
    expect(isBlogContentEmpty(legacy)).toBe(false);
  });
  it("renders an accessible toolbar and existing document content", async () => {
    render(<RichTextEditor id="content" onChange={vi.fn()} value={serializeBlogContent({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Existing body" }] }] })} />);
    expect(await screen.findByRole("textbox", { name: "Blog content editor" })).toHaveTextContent("Existing body");
    expect(screen.getByRole("toolbar", { name: "Content formatting" })).toBeInTheDocument();
    for (const name of ["Paragraph", "Heading 1", "Heading 2", "Heading 3", "Bold", "Italic", "Edit link", "Bulleted list", "Numbered list", "Undo", "Redo"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("blocks editing instead of discarding unsupported legacy nodes", () => {
    render(<RichTextEditor id="content" onChange={vi.fn()} value={JSON.stringify({ type: "doc", content: [{ type: "image" }] })} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/cannot be edited safely/i);
    expect(screen.queryByRole("textbox", { name: "Blog content editor" })).not.toBeInTheDocument();
  });
});
