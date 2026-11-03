import type { Editor } from "@tiptap/core";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isApiError } from "@/lib/api/errors";
import { validateAltText, validateContentImageFile, MAX_ALT_LENGTH, type ContentImageUploader } from "./content-image";
import styles from "./rich-text-editor.module.css";

function uploadMessage(error: unknown) {
  if (!isApiError(error)) return "The image could not be uploaded. Please try again.";
  switch (error.kind) {
    case "authentication": return "Your session has expired. Sign in again to continue.";
    case "permission": return "You do not have permission to upload images.";
    case "not_found": return "This item no longer exists, so the image could not be uploaded.";
    case "validation": return error.message;
    case "service_unavailable": return "The image could not be uploaded because storage is temporarily unavailable.";
    case "network": return "The backend could not be reached. Check the connection and try again.";
    default: return error.status === 413 ? "The image is too large to upload." : "The image could not be uploaded. Please try again.";
  }
}

/** Inserts a body image (upload, then block) or, when an image is selected, edits only its alt text. */
export function ImageDialog({ editor, upload, onClose }: { editor: Editor; upload: ContentImageUploader | null; onClose: () => void }) {
  const [selection] = useState(() => ({ from: editor.state.selection.from, to: editor.state.selection.to }));
  const [editing] = useState(() => editor.isActive("image"));
  const [alt, setAlt] = useState(() => editing ? String(editor.getAttributes("image").alt ?? "") : "");
  const [file, setFile] = useState<File>();
  const [fileError, setFileError] = useState<string>();
  const [altError, setAltError] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const id = useId();
  const dialog = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector("input")?.focus();
    return () => { if (previous?.isConnected) previous.focus(); else editor.commands.focus(); };
  }, [editor]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (submitting.current) return;
    const nextAltError = validateAltText(alt);
    const nextFileError = editing ? undefined : !file ? "Choose an image." : validateContentImageFile(file);
    setAltError(nextAltError); setFileError(nextFileError); setFailure(undefined);
    if (nextAltError || nextFileError) return;
    const altText = alt.trim();
    if (editing) {
      if (editor.chain().focus().setNodeSelection(selection.from).updateAttributes("image", { alt: altText }).run()) onClose();
      else setFailure("The alt text could not be updated.");
      return;
    }
    if (!file || !upload) return;
    submitting.current = true; setBusy(true);
    try {
      const uploaded = await upload(file);
      // Restore the editor selection saved before the dialog took focus.
      const inserted = editor.chain().focus().setTextSelection(selection).insertContent({ type: "image", attrs: { url: uploaded.url, alt: altText } }).run();
      if (inserted) onClose();
      else setFailure("The image was uploaded but could not be inserted here. Choose a position in the content and try again.");
    } catch (caught) { setFailure(uploadMessage(caught)); }
    finally { submitting.current = false; setBusy(false); }
  }

  function keyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && !busy) { event.preventDefault(); event.stopPropagation(); onClose(); }
    if (event.key !== "Tab") return;
    const controls = dialog.current?.querySelectorAll<HTMLElement>("input, button:not(:disabled)");
    if (!controls?.length) return;
    const first = controls[0]; const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  return createPortal(
    <div className={styles.videoBackdrop} onMouseDown={(event) => { if (!busy && event.target === event.currentTarget) onClose(); }}>
      <form aria-labelledby={`${id}-title`} aria-modal="true" className={styles.videoDialog} onKeyDown={keyDown} onSubmit={(event) => void submit(event)} ref={dialog} role="dialog">
        <h2 id={`${id}-title`}>{editing ? "Edit Image Alt Text" : "Add Image"}</h2>
        {!editing ? <p className={styles.videoHint}>This image is inserted into the article body. It is not the cover image.</p> : null}
        {!editing ? <>
          <label htmlFor={`${id}-file`}>Image</label>
          <Input accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" aria-invalid={Boolean(fileError)} disabled={busy} id={`${id}-file`} onChange={(event) => { setFile(event.target.files?.[0]); setFileError(undefined); setFailure(undefined); }} type="file" />
          <p className={styles.videoHint}>JPEG, PNG, or WebP. Maximum 10 MB.</p>
          {fileError ? <p role="alert">{fileError}</p> : null}
        </> : null}
        <label htmlFor={`${id}-alt`}>Alt text</label>
        <Input aria-invalid={Boolean(altError)} disabled={busy} id={`${id}-alt`} maxLength={MAX_ALT_LENGTH + 50} onChange={(event) => { setAlt(event.target.value); setAltError(undefined); }} value={alt} />
        <p className={styles.videoHint}>Describe the image for readers who cannot see it. Required, up to {MAX_ALT_LENGTH} characters.</p>
        {altError ? <p role="alert">{altError}</p> : null}
        {failure ? <p role="alert">{failure}</p> : null}
        {busy ? <p className={styles.videoHint} role="status">Uploading image…</p> : null}
        <div className={styles.videoActions}>
          <Button disabled={busy} onClick={onClose} variant="secondary">Cancel</Button>
          <Button disabled={busy || (!editing && !upload)} type="submit">{busy ? "Uploading…" : editing ? "Save Alt Text" : "Insert Image"}</Button>
        </div>
      </form>
    </div>, document.body,
  );
}
