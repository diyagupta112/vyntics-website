"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import styles from "./blogs.module.css";

type Props = { blogTitle: string; busy: boolean; error?: string; onCancel: () => void; onConfirm: () => void };

export function ConfirmDelete({ blogTitle, busy, error, onCancel, onConfirm }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);
  return (
    <div className={styles.dialogBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
      <section aria-describedby="delete-blog-description" aria-labelledby="delete-blog-title" aria-modal="true" className={styles.dialog} role="dialog" onKeyDown={(event) => { if (event.key === "Escape" && !busy) onCancel(); }}>
        <h2 id="delete-blog-title" ref={titleRef} tabIndex={-1}>Delete “{blogTitle}”?</h2>
        <p id="delete-blog-description">This action permanently removes the Blog and cannot be undone.</p>
        {error ? <p role="alert">{error}</p> : null}
        <div className={styles.actions}>
          <Button disabled={busy} onClick={onCancel} variant="secondary">Cancel</Button>
          <Button disabled={busy} onClick={onConfirm} variant="destructive">{busy ? "Deleting…" : "Delete Blog"}</Button>
        </div>
      </section>
    </div>
  );
}
