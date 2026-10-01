"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { CompactImagePreview } from "@/components/media/compact-image-preview";
import { Button } from "@/components/ui/button";
import { blogsApi } from "../api/blogs";
import { blogErrorMessage } from "../lib/errors";
import type { Blog } from "../types";
import styles from "./blogs.module.css";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

function validate(file: File): string | undefined {
  if (file.size === 0) return "Choose a non-empty image.";
  if (file.size > MAX_IMAGE_BYTES) return "The image must be 5 MB or smaller.";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!TYPES.has(file.type) || !extension || !EXTENSIONS.has(extension)) return "Choose a JPEG, PNG, or WebP image.";
}

export function CoverImageControl({ blog, onBusyChange, onChanged }: { blog: Blog; onBusyChange?: (busy: boolean) => void; onChanged: (blog: Blog) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || busy) return;
    const problem = validate(file);
    if (problem) { setError(problem); event.target.value = ""; return; }
    setBusy(true); onBusyChange?.(true); setError(undefined); setMessage(undefined);
    try {
      const updated = await blogsApi.uploadCover(blog.id, file);
      onChanged(updated); setMessage(blog.cover_image_url ? "Cover image replaced." : "Cover image uploaded.");
    } catch (caught) { setError(blogErrorMessage(caught, "upload the cover image")); }
    finally { setBusy(false); onBusyChange?.(false); event.target.value = ""; }
  }

  async function remove() {
    if (busy || blog.status === "published") return;
    setBusy(true); onBusyChange?.(true); setError(undefined); setMessage(undefined);
    try { await blogsApi.deleteCover(blog.id); onChanged({ ...blog, cover_image_url: null }); setMessage("Cover image removed."); }
    catch (caught) { setError(blogErrorMessage(caught, "remove the cover image")); }
    finally { setBusy(false); onBusyChange?.(false); }
  }

  return <section className={styles.section} aria-labelledby="cover-heading">
    <div className={styles.sectionHeading}><h2 id="cover-heading">Cover image</h2><p>JPEG, PNG, or WebP. Maximum 5 MB.</p></div>
    <div className={styles.cover}>
      <CompactImagePreview alt={`Cover for ${blog.title}`} emptyText="No cover image uploaded" imageUrl={blog.cover_image_url} label="Blog cover image" />
      <input ref={inputRef} className={styles.fileInput} disabled={busy} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" aria-label="Choose Blog cover image" onChange={(event) => void upload(event)} />
      <div className={styles.actions}>
        <Button disabled={busy} onClick={() => inputRef.current?.click()} variant="secondary">{busy ? "Working…" : blog.cover_image_url ? "Replace cover" : "Upload cover"}</Button>
        {blog.cover_image_url ? <Button disabled={busy || blog.status === "published"} onClick={() => void remove()} variant="ghost">Remove cover</Button> : null}
      </div>
      {blog.status === "published" && blog.cover_image_url ? <p className={styles.muted}>Unpublish this Blog before removing its cover.</p> : null}
      {error ? <div className={styles.feedback} role="alert"><strong>Cover was not changed</strong><p>{error}</p></div> : null}
      {message ? <div className={styles.feedback} role="status"><p>{message}</p></div> : null}
    </div>
  </section>;
}
