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

const noticePeriodLabels = {
  immediate: "Immediate",
  "15_days": "15 Days",
  "30_days": "30 Days",
  "60_days": "60 Days",
  "90_days": "90 Days",
  other: "Other",
} as const;

function experienceLabel(years: number | null, months: number | null) {
  if (years === null && months === null) return "Not provided (legacy application)";
  const parts: string[] = [];
  if (years !== null && (years > 0 || !months)) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (months !== null && months > 0) parts.push(`${months} month${months === 1 ? "" : "s"}`);
  return parts.length ? parts.join(" ") : "0 years";
}

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
        <section className={styles.detailSection}>
          <h3>Contact information</h3>
          <dl className={styles.detailList}>
            <div><dt>Name</dt><dd>{detail.name}</dd></div>
            <div><dt>Email</dt><dd><a className={styles.textLink} href={`mailto:${detail.email}`}>{detail.email}</a></dd></div>
            <div><dt>Mobile</dt><dd><a className={styles.textLink} href={`tel:${detail.phone}`}>{detail.phone}</a></dd></div>
          </dl>
        </section>
        <section className={styles.detailSection}>
          <h3>Professional information</h3>
          <dl className={styles.detailList}>
            <div><dt>Experience</dt><dd>{experienceLabel(detail.experience_years, detail.experience_months)}</dd></div>
            <div><dt>Currently working</dt><dd>{detail.currently_working === null ? "Not provided (legacy application)" : detail.currently_working ? "Yes" : "No"}</dd></div>
            <div><dt>Current company</dt><dd>{detail.current_company?.trim() || "Not provided"}</dd></div>
            <div><dt>Notice period</dt><dd>{detail.notice_period ? noticePeriodLabels[detail.notice_period] : "Not provided (legacy application)"}</dd></div>
          </dl>
        </section>
      </div>

      <div className={styles.detailGrid}>
        <section className={styles.detailSection}>
          <h3>Application information</h3>
          <dl className={styles.detailList}>
            <div><dt>Career</dt><dd>{detail.career_title_snapshot}</dd></div>
            <div><dt>Career availability</dt><dd>{detail.career_id ? "Available" : "Deleted — historical snapshot retained"}</dd></div>
            <div><dt>Applied</dt><dd><time dateTime={detail.submitted_at}>{new Intl.DateTimeFormat(undefined, { dateStyle: "long", timeStyle: "short" }).format(new Date(detail.submitted_at))}</time></dd></div>
            <div><dt>Application ID</dt><dd>{detail.id}</dd></div>
          </dl>
        </section>
        <section className={styles.detailSection}>
          <h3>Application materials</h3>
          <dl className={styles.detailList}>
            <div>
              <dt>Resume</dt>
              <dd>{detail.resume_url ? <a className={styles.textLink} href={detail.resume_url} rel="noreferrer" target="_blank">View resume</a> : "No resume provided"}</dd>
            </div>
          </dl>
          <div className={styles.coverLetter}>
            <h4>Cover letter</h4>
            <p>{detail.cover_letter || "No cover letter provided."}</p>
          </div>
        </section>
      </div>

      <form className={styles.reviewForm} onSubmit={(event) => void submit(event)}>
        <div className={styles.reviewHeading}>
          <div>
            <h3>Administrative review</h3>
            <p className={styles.muted}>Update the application status and private admin notes.</p>
          </div>
        </div>
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
