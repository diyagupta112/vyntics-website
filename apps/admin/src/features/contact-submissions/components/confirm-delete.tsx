"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import styles from "./contact-submissions.module.css";

type Props = {
  busy: boolean;
  error?: string;
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDelete({ busy, error, name, onCancel, onConfirm }: Props) {
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
        aria-describedby="delete-submission-description"
        aria-labelledby="delete-submission-title"
        aria-modal="true"
        className={styles.dialog}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !busy) onCancel();
        }}
        role="dialog"
      >
        <h2 id="delete-submission-title" ref={titleRef} tabIndex={-1}>
          Delete submission from {name}?
        </h2>
        <p id="delete-submission-description">
          This permanently removes the Contact Submission.
        </p>
        {error ? <p className={styles.feedback} role="alert">{error}</p> : null}
        <div className={styles.actions}>
          <Button disabled={busy} onClick={onCancel} variant="secondary">Cancel</Button>
          <Button disabled={busy} onClick={onConfirm} variant="destructive">
            {busy ? "Deleting…" : "Delete Submission"}
          </Button>
        </div>
      </section>
    </div>
  );
}
