"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useMemo, useState } from "react";

import {
  deserializeBlogContent,
  EMPTY_BLOG_DOCUMENT,
  serializeBlogContent,
  type BlogContentNode,
} from "./blog-content";
import { YouTubeVideoNode } from "./youtube-video-node";
import { VideoUrlDialog } from "./video-url-dialog";
import { ContentImageNode } from "./image-node";
import { ImageDialog } from "./image-dialog";
import type { ContentImageUploader } from "./content-image";
import styles from "./rich-text-editor.module.css";

type Props = {
  editorLabel?: string;
  id: string;
  resourceName?: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  /** Uploads a body image. Omit to hide the Image action; pass null to show it disabled until the resource exists. */
  imageUpload?: ContentImageUploader | null;
};

export function createBlogEditorExtensions(onVideoEdit?: () => void, onImageEdit?: () => void) { return [
  StarterKit.configure({
    blockquote: false,
    code: false,
    codeBlock: false,
    heading: { levels: [1, 2, 3] },
    horizontalRule: false,
    link: { autolink: false, openOnClick: false },
    strike: false,
    underline: false,
  }),
  YouTubeVideoNode.configure({ onEdit: onVideoEdit }),
  ContentImageNode.configure({ onEdit: onImageEdit }),
]; }

type ToolbarButtonProps = {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onRun: () => void;
  describedBy?: string;
  title?: string;
  children: React.ReactNode;
};

function ToolbarButton({ label, pressed, disabled, onRun, describedBy, title, children }: ToolbarButtonProps) {
  return (
    <button
      aria-describedby={describedBy}
      aria-label={label}
      aria-pressed={pressed}
      className={pressed ? styles.active : undefined}
      disabled={disabled}
      title={title}
      onClick={onRun}
      onMouseDown={(event) => event.preventDefault()}
      type="button"
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ editorLabel = "Blog content editor", id, resourceName = "Blog", value, onChange, invalid = false, imageUpload }: Props) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const initial = useMemo(() => {
    try {
      return { content: deserializeBlogContent(value), error: undefined };
    } catch (error) {
      return {
        content: EMPTY_BLOG_DOCUMENT,
        error: error instanceof Error ? error.message : `This ${resourceName} contains unsupported content.`,
      };
    }
  }, [resourceName, value]);

  const editorExtensions = useMemo(() => createBlogEditorExtensions(() => setVideoOpen(true), () => setImageOpen(true)), []);
  const editor = useEditor({
    extensions: editorExtensions,
    content: initial.content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-invalid": String(invalid),
        "aria-label": editorLabel,
        "aria-multiline": "true",
        class: styles.surface,
        id,
        role: "textbox",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(serializeBlogContent(currentEditor.getJSON() as BlogContentNode));
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bold: currentEditor?.isActive("bold") ?? false,
      italic: currentEditor?.isActive("italic") ?? false,
      link: currentEditor?.isActive("link") ?? false,
      paragraph: currentEditor?.isActive("paragraph") ?? false,
      h1: currentEditor?.isActive("heading", { level: 1 }) ?? false,
      h2: currentEditor?.isActive("heading", { level: 2 }) ?? false,
      h3: currentEditor?.isActive("heading", { level: 3 }) ?? false,
      bulletList: currentEditor?.isActive("bulletList") ?? false,
      orderedList: currentEditor?.isActive("orderedList") ?? false,
      image: currentEditor?.isActive("image") ?? false,
      canUndo: currentEditor?.can().chain().undo().run() ?? false,
      canRedo: currentEditor?.can().chain().redo().run() ?? false,
    }),
  });

  const imageHint = `Body images are available after the ${resourceName} is created. Choose Next to create it, then go Back to add images.`;

  function editLink() {
    if (!editor) return;
    const currentHref = String(editor.getAttributes("link").href ?? "");
    const href = window.prompt("Enter the link URL. Leave blank to remove the link.", currentHref);
    if (href === null) return;
    if (!href.trim()) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
  }

  if (initial.error) {
    return <div className={styles.editor}><p className={styles.compatibilityError} role="alert">This {resourceName} cannot be edited safely: {initial.error}</p></div>;
  }

  if (!editor) {
    return <div aria-label={`Loading ${editorLabel}`} className={styles.loading} role="status" />;
  }

  return (
    <div className={styles.editor}>
      <div aria-label="Content formatting" className={styles.toolbar} role="toolbar">
        <div className={styles.group}>
          <ToolbarButton label="Paragraph" onRun={() => editor.chain().focus().setParagraph().run()} pressed={state?.paragraph}>Paragraph</ToolbarButton>
          {[1, 2, 3].map((level) => (
            <ToolbarButton
              key={level}
              label={"Heading " + level}
              onRun={() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()}
              pressed={state?.[("h" + level) as "h1" | "h2" | "h3"]}
            >
              H{level}
            </ToolbarButton>
          ))}
        </div>
        <div className={styles.group}>
          <ToolbarButton label="Bold" onRun={() => editor.chain().focus().toggleBold().run()} pressed={state?.bold}><strong>B</strong></ToolbarButton>
          <ToolbarButton label="Italic" onRun={() => editor.chain().focus().toggleItalic().run()} pressed={state?.italic}><em>I</em></ToolbarButton>
          {imageUpload !== undefined ? <ToolbarButton describedBy={imageUpload === null ? `${id}-image-hint` : undefined} disabled={imageUpload === null && !state?.image} label="Image" onRun={() => setImageOpen(true)} title={imageUpload === null ? imageHint : undefined}>Image</ToolbarButton> : null}
          <ToolbarButton label="Video" onRun={() => setVideoOpen(true)}>Video</ToolbarButton>
          <ToolbarButton label="Edit link" onRun={editLink} pressed={state?.link}>Link</ToolbarButton>
        </div>
        <div className={styles.group}>
          <ToolbarButton label="Bulleted list" onRun={() => editor.chain().focus().toggleBulletList().run()} pressed={state?.bulletList}>• List</ToolbarButton>
          <ToolbarButton label="Numbered list" onRun={() => editor.chain().focus().toggleOrderedList().run()} pressed={state?.orderedList}>1. List</ToolbarButton>
        </div>
        <div className={styles.group}>
          <ToolbarButton disabled={!state?.canUndo} label="Undo" onRun={() => editor.chain().focus().undo().run()}>Undo</ToolbarButton>
          <ToolbarButton disabled={!state?.canRedo} label="Redo" onRun={() => editor.chain().focus().redo().run()}>Redo</ToolbarButton>
        </div>
      </div>
      {imageUpload === null ? <p className={styles.imageHint} id={`${id}-image-hint`}>{imageHint}</p> : null}
      <EditorContent className={styles.content} editor={editor} />
      {imageOpen ? <ImageDialog editor={editor} onClose={() => setImageOpen(false)} upload={imageUpload ?? null} /> : null}
      {videoOpen ? <VideoUrlDialog editor={editor} onClose={() => setVideoOpen(false)} /> : null}
    </div>
  );
}
