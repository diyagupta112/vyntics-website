import type { Editor } from "@tiptap/core";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { youtubeVideoId } from "./youtube-video";
import styles from "./rich-text-editor.module.css";

export function VideoUrlDialog({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [selection] = useState(() => ({ from: editor.state.selection.from, to: editor.state.selection.to }));
  const [editing] = useState(() => editor.isActive("video"));
  const [url, setUrl] = useState(() => editing ? `https://www.youtube.com/watch?v=${editor.getAttributes("video").video_id}` : "");
  const [error, setError] = useState<string>();
  const id = useId();
  const dialog = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector("input")?.focus();
    return () => { if (previous?.isConnected) previous.focus(); else editor.commands.focus(); };
  }, [editor]);

  function submit(event: FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    let videoId: string;
    try { videoId = youtubeVideoId(url); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Enter a valid YouTube URL."); return; }
    // Restore the editor selection saved before the URL field received focus.
    const chain = editor.chain().focus();
    const succeeded = editing
      ? chain.setNodeSelection(selection.from).updateAttributes("video", { provider: "youtube", video_id: videoId }).run()
      : chain.setTextSelection(selection).insertContent({ type: "video", attrs: { provider: "youtube", video_id: videoId } }).run();
    if (succeeded) onClose();
    else setError("The video could not be inserted here. Choose a position in the content and try again.");
  }

  function keyDown(event: KeyboardEvent) {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); }
    if (event.key !== "Tab") return;
    const controls = dialog.current?.querySelectorAll<HTMLElement>("input, button:not(:disabled)");
    if (!controls?.length) return;
    const first = controls[0]; const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  return createPortal(
    <div className={styles.videoBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form aria-labelledby={`${id}-title`} aria-modal="true" className={styles.videoDialog} onKeyDown={keyDown} onSubmit={submit} ref={dialog} role="dialog">
        <h2 id={`${id}-title`}>{editing ? "Edit Video" : "Insert Video"}</h2>
        <label htmlFor={`${id}-url`}>YouTube video URL</label>
        <Input aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`} aria-invalid={Boolean(error)} id={`${id}-url`} onChange={(event) => { setUrl(event.target.value); setError(undefined); }} value={url} />
        <p className={styles.videoHint} id={`${id}-hint`}>Paste a YouTube watch, youtu.be, embed, or Shorts URL.</p>
        {error ? <p id={`${id}-error`} role="alert">{error}</p> : null}
        <div className={styles.videoActions}>
          <Button onClick={onClose} variant="secondary">Cancel</Button>
          <Button type="submit">{editing ? "Save Video" : "Insert Video"}</Button>
        </div>
      </form>
    </div>, document.body,
  );
}
