"use client";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import styles from "./team-members.module.css";
export function ConfirmDelete({ name, busy, error, onCancel, onConfirm }: { name: string; busy: boolean; error?: string; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLHeadingElement>(null); useEffect(() => ref.current?.focus(), []);
  return <div className={styles.dialogBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}><section aria-describedby="delete-member-description" aria-labelledby="delete-member-title" aria-modal="true" className={styles.dialog} role="dialog" onKeyDown={(event) => { if (event.key === "Escape" && !busy) onCancel(); }}><h2 id="delete-member-title" ref={ref} tabIndex={-1}>Delete “{name}”?</h2><p id="delete-member-description">This permanently removes the Team Member and their managed photo.</p>{error ? <p role="alert">{error}</p> : null}<div className={styles.actions}><Button disabled={busy} onClick={onCancel} variant="secondary">Cancel</Button><Button disabled={busy} onClick={onConfirm} variant="destructive">{busy ? "Deleting…" : "Delete Team Member"}</Button></div></section></div>;
}
