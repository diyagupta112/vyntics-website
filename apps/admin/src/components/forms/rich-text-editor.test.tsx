import { Editor } from "@tiptap/core";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeAll, vi } from "vitest";

import {
  deserializeBlogContent,
  isBlogContentEmpty,
  serializeBlogContent,
  type BlogContentNode,
} from "./blog-content";
import { createBlogEditorExtensions, RichTextEditor } from "./rich-text-editor";

// jsdom has no layout geometry for text ranges; ProseMirror reads it when
// asynchronously scrolling the restored cursor into view after dialog insertion.
beforeAll(() => {
  if (!Range.prototype.getClientRects) {
    Object.defineProperty(Range.prototype, "getClientRects", { configurable: true, value: () => [] });
  }
  if (!Range.prototype.getBoundingClientRect) {
    Object.defineProperty(Range.prototype, "getBoundingClientRect", { configurable: true, value: () => new DOMRect() });
  }
});

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
    for (const name of ["Paragraph", "Heading 1", "Heading 2", "Heading 3", "Bold", "Italic", "Edit link", "Bulleted list", "Numbered list", "Video", "Undo", "Redo"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("blocks editing instead of discarding unsupported legacy nodes", () => {
    render(<RichTextEditor id="content" onChange={vi.fn()} value={JSON.stringify({ type: "doc", content: [{ type: "image" }] })} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/cannot be edited safely/i);
    expect(screen.queryByRole("textbox", { name: "Blog content editor" })).not.toBeInTheDocument();
  });
});


describe("YouTube editor blocks", () => {
  const video = { type: "video", attrs: { provider: "youtube", video_id: "dQw4w9WgXcQ" } };
  const before = { type: "paragraph", content: [{ type: "text", text: "Before" }] };
  const after = { type: "paragraph", content: [{ type: "text", text: "After" }] };

  it("inserts a block at the current position, preserves paragraphs, and supports undo/redo and deletion", () => {
    const editor = createEditor({ type: "doc", content: [before, after] });
    editor.commands.setTextSelection(8);
    editor.commands.insertContent(video);
    const json = editor.getJSON();
    expect(json.content).toEqual([before, video, after]);
    expect(JSON.parse(serializeBlogContent(json as BlogContentNode))).toEqual(json);
    editor.commands.undo();
    expect(editor.getJSON().content).toEqual([before, after]);
    editor.commands.redo();
    expect(editor.getJSON().content).toEqual([before, video, after]);
    editor.commands.setNodeSelection(8);
    editor.commands.deleteSelection();
    expect(editor.getJSON().content).toEqual([before, after]);
    editor.destroy();
  });

  it("preserves an existing video through unrelated text edits and reload", () => {
    const editor = createEditor(deserializeBlogContent({ type: "doc", content: [before, video, after] }));
    editor.commands.setTextSelection({ from: 1, to: 7 });
    editor.commands.toggleBold();
    const serialized = serializeBlogContent(editor.getJSON() as BlogContentNode);
    const restored = createEditor(deserializeBlogContent(serialized));
    expect(restored.getJSON().content?.[1]).toEqual(video);
    expect(restored.getJSON().content?.[0]?.content?.[0]?.marks).toEqual([{ type: "bold" }]);
    expect(restored.getJSON().content?.[2]).toEqual(after);
    editor.destroy();
    restored.destroy();
  });

  it("allows typing before and after a video and creating a paragraph at its end", () => {
    const editor = createEditor({ type: "doc", content: [before, video, after] });
    editor.commands.setTextSelection(7);
    editor.commands.insertContent(" text");
    editor.commands.focus("end");
    editor.commands.insertContent(" text");
    expect(editor.getJSON().content?.[1]).toEqual(video);
    expect(editor.getJSON().content?.[0]?.content?.[0]).toMatchObject({ type: "text", text: "Before text" });
    expect(editor.getJSON().content?.[2]?.content?.[0]).toMatchObject({ type: "text", text: "After text" });
    editor.commands.focus("end");
    editor.commands.insertContent(video);
    editor.commands.createParagraphNear();
    editor.commands.focus("end");
    editor.commands.insertContent("Continue typing");
    expect(editor.getJSON().content?.at(-1)?.type).toBe("paragraph");
    expect(editor.getText()).toContain("Continue typing");
    editor.destroy();
  });

  it.each(["Blog", "Case Study"])("loads and edits existing videos in the %s editor", async (resource) => {
    const onChange = vi.fn();
    render(<RichTextEditor id="video-content" resourceName={resource} editorLabel={`${resource} content editor`} onChange={onChange} value={JSON.stringify({ type: "doc", content: [before, video, after] })} />);
    await screen.findByRole("textbox", { name: `${resource} content editor` });
    const iframe = document.querySelector("iframe");
    expect(iframe).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    fireEvent.click(screen.getByRole("button", { name: "Edit video" }));
    const dialog = await screen.findByRole("dialog", { name: "Edit Video" });
    expect(within(dialog).getByLabelText("YouTube video URL")).toHaveValue("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    fireEvent.change(within(dialog).getByLabelText("YouTube video URL"), { target: { value: "https://youtu.be/9bZkp7q19f0" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save Video" }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(JSON.parse(onChange.mock.lastCall![0]).content).toEqual([before, { type: "video", attrs: { provider: "youtube", video_id: "9bZkp7q19f0" } }, after]);
    fireEvent.click(screen.getByRole("button", { name: "Remove video" }));
    expect(JSON.parse(onChange.mock.lastCall![0]).content).toEqual([before, after]);
  });

  it.each(["", "https://example.com/video", '<iframe src="https://youtube.com/embed/dQw4w9WgXcQ"></iframe>'])("keeps the dialog open for invalid URL %s", async (url) => {
    const onChange = vi.fn();
    render(<RichTextEditor id="content" onChange={onChange} value={JSON.stringify({ type: "doc", content: [before] })} />);
    fireEvent.click(await screen.findByRole("button", { name: "Video" }));
    const dialog = screen.getByRole("dialog", { name: "Insert Video" });
    fireEvent.change(within(dialog).getByLabelText("YouTube video URL"), { target: { value: url } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Insert Video" }));
    expect(within(dialog).getByRole("alert")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(within(dialog).getByLabelText("YouTube video URL"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not submit the surrounding resource form when inserting video", async () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(<form onSubmit={submit}><RichTextEditor id="content" onChange={vi.fn()} value={JSON.stringify({ type: "doc", content: [before] })} /></form>);
    fireEvent.click(await screen.findByRole("button", { name: "Video" }));
    const dialog = screen.getByRole("dialog", { name: "Insert Video" });
    fireEvent.change(within(dialog).getByLabelText("YouTube video URL"), { target: { value: "https://youtu.be/dQw4w9WgXcQ" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Insert Video" }));
    expect(submit).not.toHaveBeenCalled();
  });

  it.each(["https://youtube.com/watch?v=dQw4w9WgXcQ", "https://youtu.be/dQw4w9WgXcQ", "https://youtube.com/embed/dQw4w9WgXcQ"])("inserts canonical content from %s", async (url) => {
    const onChange = vi.fn();
    render(<RichTextEditor id="content" onChange={onChange} value={JSON.stringify({ type: "doc", content: [before] })} />);
    fireEvent.click(await screen.findByRole("button", { name: "Video" }));
    const dialog = screen.getByRole("dialog", { name: "Insert Video" });
    fireEvent.change(within(dialog).getByLabelText("YouTube video URL"), { target: { value: url } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Insert Video" }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(JSON.parse(onChange.mock.lastCall![0]).content).toContainEqual(video);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
