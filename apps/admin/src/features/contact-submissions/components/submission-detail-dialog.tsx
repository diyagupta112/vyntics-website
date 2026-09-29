"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { ContactSubmission } from "../types";
import styles from "./contact-submissions.module.css";

type Props = {
  error?: string;
  loading: boolean;
  onClose: () => void;
  submission?: ContactSubmission;
};

export function SubmissionDetailDialog({ error, loading, onClose, submission }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => titleRef.current?.focus(), []);

  return (
    <div
      className={styles.dialogBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="submission-detail-title"
        aria-modal="true"
        className={`${styles.dialog} ${styles.detailDialog}`}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
        role="dialog"
      >
        <div className={styles.dialogHeading}>
          <h2 id="submission-detail-title" ref={titleRef} tabIndex={-1}>
            Contact Submission
          </h2>
          <Button onClick={onClose} variant="ghost">Close</Button>
        </div>

        {loading ? <p role="status">Loading submission details…</p> : null}
        {error ? <p className={styles.feedback} role="alert">{error}</p> : null}
        {submission ? (
          <dl className={styles.detailList}>
            <div><dt>Name</dt><dd>{submission.name}</dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${submission.email}`}>{submission.email}</a></dd></div>
            <div><dt>Company</dt><dd>{submission.company || "Not provided"}</dd></div>
            <div><dt>Subject</dt><dd>{submission.subject}</dd></div>
            <div className={styles.fullDetail}><dt>Message</dt><dd>{submission.message}</dd></div>
            <div className={styles.fullDetail}><dt>Source Page</dt><dd>{submission.source_page}</dd></div>
          </dl>
        ) : null}
      </section>
    </div>
  );
}
