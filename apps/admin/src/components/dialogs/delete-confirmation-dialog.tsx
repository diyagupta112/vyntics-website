"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import styles from "./delete-confirmation-dialog.module.css";

export function DeleteConfirmationDialog({ busy, description, error, itemName, onCancel, onConfirm, resourceLabel }: { busy: boolean; description?: string; error?: string; itemName: string; onCancel: () => void; onConfirm: () => void; resourceLabel: string }) {
  const titleId = useId(); const descriptionId = useId(); const dialogRef = useRef<HTMLElement>(null); const titleRef = useRef<HTMLHeadingElement>(null); const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => { previousFocus.current = document.activeElement as HTMLElement | null; titleRef.current?.focus(); return () => previousFocus.current?.focus(); }, []);
  function keyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape" && !busy) onCancel();
    if (event.key !== "Tab") return;
    const controls = dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled)"); if (!controls?.length) return;
    const first = controls[0]; const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
    <section aria-describedby={descriptionId} aria-labelledby={titleId} aria-modal="true" className={styles.dialog} onKeyDown={keyDown} ref={dialogRef} role="dialog">
      <h2 id={titleId} ref={titleRef} tabIndex={-1}>Delete {resourceLabel}?</h2>
      <p id={descriptionId}>{description ?? `Are you sure you want to permanently delete “${itemName}”? This action cannot be undone.`}</p>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <div className={styles.actions}><Button disabled={busy} onClick={onCancel} variant="secondary">Cancel</Button><Button disabled={busy} onClick={onConfirm} variant="destructive">{busy ? "Deleting…" : "Delete Permanently"}</Button></div>
    </section>
  </div>;
}
