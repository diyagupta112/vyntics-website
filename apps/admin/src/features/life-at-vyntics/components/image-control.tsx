"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { CompactImagePreview } from "@/components/media/compact-image-preview";
import { Button } from "@/components/ui/button";
import { lifeAtVynticsApi } from "../api/life-at-vyntics";
import { lifeErrorMessage } from "../lib/errors";
import type { LifeAtVyntics } from "../types";
import styles from "./life-at-vyntics.module.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

export function validateLifeImage(file: File) {
  if (!file.size) return "Choose a non-empty image.";
  if (file.size > MAX_IMAGE_SIZE) return "The image must be 5 MB or smaller.";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!IMAGE_TYPES.has(file.type) || !extension || !IMAGE_EXTENSIONS.has(extension)) return "Choose a JPEG, PNG, or WebP image.";
}

export function ImageControl({ item, onBusyChange, onChanged }: { item: LifeAtVyntics; onBusyChange?: (busy: boolean) => void; onChanged: (item: LifeAtVyntics) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || busy) return;
    const problem = validateLifeImage(file);
    if (problem) { setError(problem); event.target.value = ""; return; }
    setBusy(true); onBusyChange?.(true); setError(undefined); setMessage(undefined);
    try {
      const updated = await lifeAtVynticsApi.uploadImage(item.id, file);
      onChanged(updated);
      setMessage(item.image_url ? "Image replaced." : "Image uploaded.");
    } catch (caught) { setError(lifeErrorMessage(caught, "upload the image")); }
    finally { setBusy(false); onBusyChange?.(false); event.target.value = ""; }
  }

  async function remove() {
    if (busy) return;
    setBusy(true); onBusyChange?.(true); setError(undefined); setMessage(undefined);
    try {
      await lifeAtVynticsApi.deleteImage(item.id);
      onChanged({ ...item, image_url: null });
      setMessage("Image removed.");
    } catch (caught) { setError(lifeErrorMessage(caught, "remove the image")); }
    finally { setBusy(false); onBusyChange?.(false); }
  }

  return <section aria-labelledby="life-image-heading" className={styles.section}>
    <div className={styles.sectionHeading}><h2 id="life-image-heading">Image</h2><p>JPEG, PNG, or WebP. Maximum 5 MB. Replacing or removing the image does not change its position.</p></div>
    <div className={styles.imageControl}>
      <CompactImagePreview alt={`Life at Vyntics image ${item.display_order}`} emptyText="No image uploaded" imageUrl={item.image_url} label="Life at Vyntics image" />
      <input accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" aria-label="Choose Life at Vyntics image" className={styles.fileInput} disabled={busy} onChange={(event) => void upload(event)} ref={input} type="file" />
      <div className={styles.actions}><Button disabled={busy} onClick={() => input.current?.click()} variant="secondary">{busy ? "Working…" : item.image_url ? "Replace Image" : "Upload Image"}</Button>{item.image_url ? <Button disabled={busy} onClick={() => void remove()} variant="ghost">Remove Image</Button> : null}</div>
      {busy ? <p className={styles.muted} role="status">Updating image…</p> : null}
      {error ? <p className={styles.feedback} role="alert">{error}</p> : null}
      {message ? <p className={styles.feedback} role="status">{message}</p> : null}
    </div>
  </section>;
}
