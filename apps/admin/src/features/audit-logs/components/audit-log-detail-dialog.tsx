"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { AuditLogDetail, JsonValue } from "../types";
import styles from "./audit-logs.module.css";

type Props = {
  auditLog?: AuditLogDetail;
  error?: string;
  loading: boolean;
  onClose: () => void;
};

function label(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ContextValue({ value }: { value: JsonValue }) {
  if (value === null) return <span className={styles.muted}>None</span>;
  if (typeof value === "boolean") return <span>{value ? "Yes" : "No"}</span>;
  if (typeof value === "string" || typeof value === "number") {
    return <span>{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className={styles.muted}>Empty list</span>;
    return (
      <ol className={styles.contextList}>
        {value.map((item, index) => (
          <li key={index}><ContextValue value={item} /></li>
        ))}
      </ol>
    );
  }

  const entries = Object.entries(value);
  if (entries.length === 0) return <span className={styles.muted}>No values</span>;
  return (
    <dl className={styles.contextObject}>
      {entries.map(([key, item]) => (
        <div key={key}>
          <dt>{label(key)}</dt>
          <dd><ContextValue value={item} /></dd>
        </div>
      ))}
    </dl>
  );
}

export function AuditLogDetailDialog({
  auditLog,
  error,
  loading,
  onClose,
}: Props) {
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
        aria-labelledby="audit-log-detail-title"
        aria-modal="true"
        className={styles.dialog}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
        role="dialog"
      >
        <div className={styles.dialogHeading}>
          <h2 id="audit-log-detail-title" ref={titleRef} tabIndex={-1}>
            Audit Log Details
          </h2>
          <Button onClick={onClose} variant="ghost">Close</Button>
        </div>

        {loading ? <p role="status">Loading audit details…</p> : null}
        {error ? <p className={styles.feedback} role="alert">{error}</p> : null}
        {auditLog ? (
          <>
            <dl className={styles.detailList}>
              <div><dt>Actor</dt><dd>{auditLog.actor_email ?? "System / anonymous"}</dd></div>
              <div><dt>Actor ID</dt><dd>{auditLog.actor_id ?? "Not recorded"}</dd></div>
              <div><dt>Action</dt><dd>{label(auditLog.action)}</dd></div>
              <div><dt>Resource</dt><dd>{label(auditLog.resource_type)}</dd></div>
              <div><dt>Resource ID</dt><dd>{auditLog.resource_id ?? "Not recorded"}</dd></div>
              <div>
                <dt>Date / Time</dt>
                <dd>
                  <time dateTime={auditLog.created_at}>
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: "long",
                      timeStyle: "short",
                    }).format(new Date(auditLog.created_at))}
                  </time>
                </dd>
              </div>
            </dl>
            <section aria-labelledby="audit-context-title" className={styles.contextSection}>
              <h3 id="audit-context-title">Context</h3>
              <ContextValue value={auditLog.context} />
            </section>
          </>
        ) : null}
      </section>
    </div>
  );
}
