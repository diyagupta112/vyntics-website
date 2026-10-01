"use client";

import { type FormEvent, useState } from "react";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { jobApplicationsApi } from "../api/job-applications";
import { applicationErrorMessage } from "../lib/errors";
import type { JobApplicationDetail, JobApplicationStatus } from "../types";
import styles from "./job-applications.module.css";

type Props = {
  detail: JobApplicationDetail;
  onDelete: () => void;
  onUpdated: (detail: JobApplicationDetail) => void;
};

export function ApplicationDetail({ detail, onDelete, onUpdated }: Props) {
  const [status, setStatus] = useState<JobApplicationStatus>(detail.status);
  const [notes, setNotes] = useState(detail.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(undefined);
    setMessage(undefined);
    try {
      const updated = await jobApplicationsApi.update(detail.id, {
        status,
        notes: notes.trim() ? notes : null,
      });
      setStatus(updated.status);
      setNotes(updated.notes ?? "");
      onUpdated(updated);
      setMessage("Application changes saved.");
    } catch (caught) {
      setError(applicationErrorMessage(caught, "save this Job Application"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailGrid}>
        <section>
          <h3>Applicant</h3>
          <dl className={styles.detailList}>
            <div><dt>Name</dt><dd>{detail.name}</dd></div>
            <div><dt>Email</dt><dd>{detail.email}</dd></div>
            <div><dt>Mobile</dt><dd>{detail.phone}</dd></div>
            <div><dt>Submitted</dt><dd><time dateTime={detail.submitted_at}>{new Intl.DateTimeFormat(undefined, { dateStyle: "long", timeStyle: "short" }).format(new Date(detail.submitted_at))}</time></dd></div>
          </dl>
        </section>
        <section>
          <h3>Career context</h3>
          <dl className={styles.detailList}>
            <div><dt>Career</dt><dd>{detail.career_title_snapshot}</dd></div>
            <div><dt>Career slug</dt><dd>{detail.career_slug_snapshot}</dd></div>
            <div><dt>Live Career</dt><dd>{detail.career_id ? "Available" : "Deleted - historical snapshot retained"}</dd></div>
          </dl>
        </section>
      </div>

      <section className={styles.longContent}>
        <h3>Cover letter</h3>
        <p>{detail.cover_letter || "No cover letter provided."}</p>
      </section>

      <form className={styles.reviewForm} onSubmit={(event) => void submit(event)}>
        <h3>Administrative review</h3>
        <div className={styles.reviewFields}>
          <FormField htmlFor={`status-${detail.id}`} label="Status" required>
            <Select id={`status-${detail.id}`} onChange={(event) => setStatus(event.target.value as JobApplicationStatus)} value={status}>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </Select>
          </FormField>
          <FormField hint="Leave empty to clear existing notes." htmlFor={`notes-${detail.id}`} label="Notes">
            <Textarea id={`notes-${detail.id}`} onChange={(event) => setNotes(event.target.value)} value={notes} />
          </FormField>
        </div>
        {error ? <p className={styles.feedback} role="alert">{error}</p> : null}
        {message ? <p className={styles.feedback} role="status">{message}</p> : null}
        <div className={styles.actions}>
          <Button disabled={busy} type="submit">{busy ? "Saving…" : "Save Changes"}</Button>
          <Button disabled={busy} onClick={onDelete} type="button" variant="destructive">Delete Application</Button>
        </div>
      </form>
    </div>
  );
}
