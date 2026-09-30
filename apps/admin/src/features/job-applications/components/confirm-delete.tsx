"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import styles from "./job-applications.module.css";

type Props = {
  applicantName: string;
  busy: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDelete({ applicantName, busy, error, onCancel, onConfirm }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), []);
  return (
    <div className={styles.dialogBackdrop} onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onCancel();
    }}>
      <section
        aria-describedby="delete-application-description"
        aria-labelledby="delete-application-title"
        aria-modal="true"
        className={styles.dialog}
        role="dialog"
        onKeyDown={(event) => {
          if (event.key === "Escape" && !busy) onCancel();
        }}
      >
        <h2 id="delete-application-title" ref={titleRef} tabIndex={-1}>
          Delete {applicantName}’s application?
        </h2>
        <p id="delete-application-description">
          This permanently removes the application and its private resume.
        </p>
        {error ? <p role="alert">{error}</p> : null}
        <div className={styles.actions}>
          <Button disabled={busy} onClick={onCancel} variant="secondary">Cancel</Button>
          <Button disabled={busy} onClick={onConfirm} variant="destructive">
            {busy ? "Deleting…" : "Delete Application"}
          </Button>
        </div>
      </section>
    </div>
  );
}
