"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import styles from "./careers.module.css";

type Props = {
  title: string;
  busy: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDelete({
  title,
  busy,
  error,
  onCancel,
  onConfirm,
}: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), []);

  return (
    <div
      className={styles.dialogBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <section
        aria-describedby="delete-career-description"
        aria-labelledby="delete-career-title"
        aria-modal="true"
        className={styles.dialog}
        role="dialog"
        onKeyDown={(event) => {
          if (event.key === "Escape" && !busy) onCancel();
        }}
      >
        <h2 id="delete-career-title" ref={titleRef} tabIndex={-1}>
          Delete “{title}”?
        </h2>
        <p id="delete-career-description">
          This permanently removes the Career and makes the role unavailable.
          Existing applications remain in the system.
        </p>
        {error ? <p role="alert">{error}</p> : null}
        <div className={styles.actions}>
          <Button disabled={busy} onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button disabled={busy} onClick={onConfirm} variant="destructive">
            {busy ? "Deleting…" : "Delete Career"}
          </Button>
        </div>
      </section>
    </div>
  );
}
