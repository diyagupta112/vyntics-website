"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useMemo } from "react";

import {
  deserializeBlogContent,
  EMPTY_BLOG_DOCUMENT,
  serializeBlogContent,
  type BlogContentNode,
} from "./blog-content";
import styles from "./rich-text-editor.module.css";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
};

export function createBlogEditorExtensions() { return [
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
]; }

type ToolbarButtonProps = {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onRun: () => void;
  children: React.ReactNode;
};

function ToolbarButton({ label, pressed, disabled, onRun, children }: ToolbarButtonProps) {
  return (
    <button
      aria-label={label}
      aria-pressed={pressed}
      className={pressed ? styles.active : undefined}
      disabled={disabled}
      onClick={onRun}
      onMouseDown={(event) => event.preventDefault()}
      type="button"
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ id, value, onChange, invalid = false }: Props) {
  const initial = useMemo(() => {
    try {
      return { content: deserializeBlogContent(value), error: undefined };
    } catch (error) {
      return {
        content: EMPTY_BLOG_DOCUMENT,
        error: error instanceof Error ? error.message : "This Blog contains unsupported content.",
      };
    }
  }, [value]);

  const editorExtensions = useMemo(() => createBlogEditorExtensions(), []);
  const editor = useEditor({
    extensions: editorExtensions,
    content: initial.content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-invalid": String(invalid),
        "aria-label": "Blog content editor",
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
      canUndo: currentEditor?.can().chain().undo().run() ?? false,
      canRedo: currentEditor?.can().chain().redo().run() ?? false,
    }),
  });

  function editLink() {
    if (!editor) return;
    const currentHref = String(editor.getAttributes("link").href ?? "");
    const href = window.prompt("Enter the link URL. Leave blank to remove the link.", currentHref);
    if (href === null) return;
    if (!href.trim()) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
  }

  if (initial.error) {
    return <div className={styles.editor}><p className={styles.compatibilityError} role="alert">This Blog cannot be edited safely: {initial.error}</p></div>;
  }

  if (!editor) {
    return <div aria-label="Loading Blog content editor" className={styles.loading} role="status" />;
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
      <EditorContent className={styles.content} editor={editor} />
    </div>
  );
}
