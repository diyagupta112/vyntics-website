"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { JobApplicationDetail, JobApplicationListItem } from "../types";
import { ApplicationDetail } from "./application-detail";
import { StatusBadge } from "./status-badge";
import styles from "./job-applications.module.css";

type Props = {
  application: JobApplicationListItem;
  detail?: JobApplicationDetail;
  error?: string;
  loading: boolean;
  onClose: () => void;
  onDelete: () => void;
  onRetry: () => void;
  onUpdated: (detail: JobApplicationDetail) => void;
  returnFocusTo: HTMLElement | null;
};

export function ApplicantDetailDialog({ application, detail, error, loading, onClose, onDelete, onRetry, onUpdated, returnFocusTo }: Props) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = returnFocusTo ?? document.activeElement as HTMLElement | null;
    titleRef.current?.focus();
    return () => {
      if (previousFocus.current?.isConnected) previousFocus.current.focus();
    };
  }, [returnFocusTo]);

  function keyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = dialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    );
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === titleRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const current = detail ?? application;

  return (
    <div className={styles.applicantDialogBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles.applicantDialog}
        onKeyDown={keyDown}
        ref={dialogRef}
        role="dialog"
      >
        <header className={styles.applicantDialogHeader}>
          <div className={styles.dialogTitleGroup}>
            <p className={styles.eyebrow}>Applicant details</p>
            <div className={styles.dialogTitleLine}>
              <h2 id={titleId} ref={titleRef} tabIndex={-1}>{current.name}</h2>
              <StatusBadge status={current.status} />
            </div>
            <p className={styles.muted} id={descriptionId}>Application for {current.career_title_snapshot}</p>
          </div>
          <Button aria-label="Close applicant details" onClick={onClose} variant="ghost">Close</Button>
        </header>

        <div className={styles.applicantDialogBody}>
          {loading ? <div className={styles.dialogState} role="status"><div className={styles.detailSkeleton} /><p>Loading applicant details…</p></div> : null}
          {!loading && error ? (
            <div className={styles.dialogState} role="alert">
              <h3>Applicant details could not be loaded</h3>
              <p>{error}</p>
              <Button onClick={onRetry} variant="secondary">Try again</Button>
            </div>
          ) : null}
          {!loading && detail ? <ApplicationDetail detail={detail} onDelete={onDelete} onUpdated={onUpdated} /> : null}
        </div>
      </section>
    </div>
  );
}
