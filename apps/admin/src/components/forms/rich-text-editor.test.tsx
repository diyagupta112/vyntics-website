import { Editor } from "@tiptap/core";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeAll, vi } from "vitest";

import {
  deserializeBlogContent,
  isBlogContentEmpty,
  serializeBlogContent,
  type BlogContentNode,
} from "./blog-content";
import { ApiError } from "@/lib/api/errors";
import { validateAltText, validateContentImageFile } from "./content-image";
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
    expect(() => deserializeBlogContent({ type: "doc", content: [{ type: "table" }] })).toThrow(/unsupported content type/i);
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
    render(<RichTextEditor id="content" onChange={vi.fn()} value={JSON.stringify({ type: "doc", content: [{ type: "table" }] })} />);
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

describe("Body image blocks", () => {
  const image = { type: "image", attrs: { url: "https://cdn.example.com/a.png", alt: "AWS architecture diagram" } };
  const image2 = { type: "image", attrs: { url: "https://cdn.example.com/b.webp", alt: "Second" } };
  const video = { type: "video", attrs: { provider: "youtube", video_id: "dQw4w9WgXcQ" } };
  const before = { type: "paragraph", content: [{ type: "text", text: "Before" }] };
  const after = { type: "paragraph", content: [{ type: "text", text: "After" }] };
  const ok = new File(["png"], "a.png", { type: "image/png" });
  const uploaded = { url: "https://cdn.example.com/new.png", content_type: "image/png", size_bytes: 3 };

  function open(upload: ((file: File) => Promise<typeof uploaded>) | null | undefined, onChange = vi.fn()) {
    render(<RichTextEditor id="content" imageUpload={upload} onChange={onChange} value={JSON.stringify({ type: "doc", content: [before, after] })} />);
    return onChange;
  }
  async function fill(file: File | undefined, alt: string) {
    fireEvent.click(await screen.findByRole("button", { name: "Image" }));
    const dialog = screen.getByRole("dialog", { name: "Add Image" });
    if (file) fireEvent.change(within(dialog).getByLabelText("Image"), { target: { files: [file] } });
    fireEvent.change(within(dialog).getByLabelText("Alt text"), { target: { value: alt } });
    return dialog;
  }

  it("keeps exactly type and attrs {url, alt}, and rejects extra or presentation properties", () => {
    expect(JSON.parse(serializeBlogContent({ type: "doc", content: [image] } as BlogContentNode)).content[0]).toEqual(image);
    for (const bad of [
      { type: "image", attrs: { src: "x", alt: "a" } },
      { type: "image", attrs: { url: "x", alt: "a", width: 100 } },
      { type: "image", attrs: { url: "x" } },
      { type: "image", attrs: { url: "x", alt: "a" }, content: [] },
    ]) expect(() => deserializeBlogContent({ type: "doc", content: [bad] })).toThrow();
    expect(isBlogContentEmpty({ type: "doc", content: [image] } as BlogContentNode)).toBe(false);
  });

  it("inserts, undoes, removes, and mixes several images with video at the cursor", () => {
    const editor = createEditor({ type: "doc", content: [before, after] });
    editor.commands.setTextSelection(8);
    editor.commands.insertContent(image);
    expect(editor.getJSON().content).toEqual([before, image, after]);
    editor.commands.focus("end");
    editor.commands.insertContent(video);
    editor.commands.focus("end");
    editor.commands.insertContent(image2);
    expect(editor.getJSON().content?.filter((node) => node.type === "image")).toEqual([image, image2]);
    expect(editor.getJSON().content?.some((node) => node.type === "video")).toBe(true);
    editor.destroy();
  });

  it("supports undo, redo, and deletion of an inserted image", () => {
    const editor = createEditor({ type: "doc", content: [before, after] });
    editor.commands.setTextSelection(8);
    editor.commands.insertContent(image);
    editor.commands.undo();
    expect(editor.getJSON().content).toEqual([before, after]);
    editor.commands.redo();
    expect(editor.getJSON().content).toEqual([before, image, after]);
    editor.commands.setNodeSelection(8);
    editor.commands.deleteSelection();
    expect(editor.getJSON().content).toEqual([before, after]);
    editor.destroy();
  });

  it("loads an existing image, preserves url and alt through an unrelated edit, and renders it", async () => {
    const onChange = vi.fn();
    render(<RichTextEditor id="content" onChange={onChange} value={JSON.stringify({ type: "doc", content: [before, image] })} />);
    const img = await screen.findByRole("img", { name: "AWS architecture diagram" });
    expect(img).toHaveAttribute("src", image.attrs.url);
    expect(screen.queryByText(image.attrs.url)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove image" }));
    await waitFor(() => expect(JSON.parse(onChange.mock.lastCall![0]).content).toEqual([before]));
  });

  it("edits only the alt text of an existing image", async () => {
    const onChange = vi.fn();
    render(<RichTextEditor id="content" imageUpload={vi.fn()} onChange={onChange} value={JSON.stringify({ type: "doc", content: [before, image] })} />);
    fireEvent.click(await screen.findByRole("button", { name: "Edit alt text" }));
    const dialog = screen.getByRole("dialog", { name: "Edit Image Alt Text" });
    expect(within(dialog).queryByLabelText("Image")).not.toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText("Alt text"), { target: { value: " Updated description " } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save Alt Text" }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(JSON.parse(onChange.mock.lastCall![0]).content[1]).toEqual({ type: "image", attrs: { url: image.attrs.url, alt: "Updated description" } });
  });

  it("is hidden without an uploader and disabled until the resource exists", async () => {
    open(undefined);
    await screen.findByRole("button", { name: "Bold" });
    expect(screen.queryByRole("button", { name: "Image" })).not.toBeInTheDocument();
  });
  it("is disabled before the resource has an ID", async () => {
    open(null);
    const button = await screen.findByRole("button", { name: "Image" });
    expect(button).toBeDisabled();
    const hint = screen.getByText(/Body images are available after the Blog is created/);
    expect(button).toHaveAttribute("aria-describedby", hint.id);
    expect(button).toHaveAttribute("title", hint.textContent!);
  });
  it("is enabled when an uploader is provided", async () => {
    open(vi.fn());
    expect(await screen.findByRole("button", { name: "Image" })).toBeEnabled();
    expect(screen.queryByText(/Body images are available after/)).not.toBeInTheDocument();
  });

  it("uploads once, then inserts the exact block", async () => {
    const upload = vi.fn().mockResolvedValue(uploaded);
    const onChange = open(upload);
    const dialog = await fill(ok, "  A diagram  ");
    fireEvent.click(within(dialog).getByRole("button", { name: "Insert Image" }));
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    expect(upload).toHaveBeenCalledWith(ok);
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(JSON.parse(onChange.mock.lastCall![0]).content).toContainEqual({ type: "image", attrs: { url: uploaded.url, alt: "A diagram" } });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not insert anything when the upload fails, shows the backend message, and allows retry", async () => {
    const upload = vi.fn().mockRejectedValueOnce(new ApiError({ kind: "validation", status: 422, message: "Unsupported image content." })).mockResolvedValueOnce(uploaded);
    const onChange = open(upload);
    const dialog = await fill(ok, "A diagram");
    fireEvent.click(within(dialog).getByRole("button", { name: "Insert Image" }));
    expect(await within(dialog).findByText("Unsupported image content.")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Insert Image" }));
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it("blocks duplicate submissions while uploading", async () => {
    let finish: (value: typeof uploaded) => void = () => undefined;
    const upload = vi.fn(() => new Promise<typeof uploaded>((resolve) => { finish = resolve; }));
    open(upload);
    const dialog = await fill(ok, "A diagram");
    fireEvent.click(within(dialog).getByRole("button", { name: "Insert Image" }));
    fireEvent.submit(dialog);
    expect(await within(dialog).findByText("Uploading image…")).toBeInTheDocument();
    expect(upload).toHaveBeenCalledTimes(1);
    finish(uploaded);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it.each([
    ["JPEG", new File(["x"], "a.jpg", { type: "image/jpeg" })],
    ["PNG", new File(["x"], "a.png", { type: "image/png" })],
    ["WebP", new File(["x"], "a.webp", { type: "image/webp" })],
  ])("accepts %s", (_name, file) => expect(validateContentImageFile(file)).toBeUndefined());

  it.each([
    ["GIF", new File(["x"], "a.gif", { type: "image/gif" })],
    ["SVG", new File(["x"], "a.svg", { type: "image/svg+xml" })],
    ["PDF", new File(["x"], "a.pdf", { type: "application/pdf" })],
    ["empty", new File([], "a.png", { type: "image/png" })],
    ["oversized", new File([new Uint8Array(10 * 1024 * 1024 + 1)], "a.png", { type: "image/png" })],
  ])("rejects %s without uploading", async (_name, file) => {
    const upload = vi.fn();
    open(upload);
    const dialog = await fill(file, "Alt");
    fireEvent.click(within(dialog).getByRole("button", { name: "Insert Image" }));
    expect(await within(dialog).findByRole("alert")).toBeInTheDocument();
    expect(upload).not.toHaveBeenCalled();
  });

  it.each([["", "Alt text is required."], ["   ", "Alt text is required."], ["a".repeat(301), "Alt text must be 300 characters or fewer."]])("validates alt text %#", async (alt, message) => {
    const upload = vi.fn();
    open(upload);
    const dialog = await fill(ok, alt);
    fireEvent.click(within(dialog).getByRole("button", { name: "Insert Image" }));
    expect(await within(dialog).findByText(message)).toBeInTheDocument();
    expect(upload).not.toHaveBeenCalled();
    expect(validateAltText("a".repeat(300))).toBeUndefined();
  });
});
