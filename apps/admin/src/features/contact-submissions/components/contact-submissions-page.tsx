"use client";

import { type KeyboardEvent, useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { contactSubmissionsApi } from "../api/contact-submissions";
import { contactSubmissionErrorMessage } from "../lib/errors";
import { truncateText } from "../lib/truncate";
import type { ContactSubmission } from "../types";
import { ConfirmDelete } from "./confirm-delete";
import styles from "./contact-submissions.module.css";
import { SubmissionDetailDialog } from "./submission-detail-dialog";

export function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [selectedId, setSelectedId] = useState<string>();
  const [detail, setDetail] = useState<ContactSubmission>();
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string>();
  const [deleting, setDeleting] = useState<ContactSubmission>();
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const [feedback, setFeedback] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setSubmissions(await contactSubmissionsApi.list());
    } catch (caught) {
      setError(contactSubmissionErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    contactSubmissionsApi.list()
      .then((items) => {
        if (active) setSubmissions(items);
      })
      .catch((caught: unknown) => {
        if (active) setError(contactSubmissionErrorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function openDetail(submissionId: string) {
    setSelectedId(submissionId);
    setDetail(undefined);
    setDetailError(undefined);
    setDetailLoading(true);
    try {
      setDetail(await contactSubmissionsApi.get(submissionId));
    } catch (caught) {
      setDetailError(contactSubmissionErrorMessage(caught, "load this Contact Submission"));
    } finally {
      setDetailLoading(false);
    }
  }

  function handleRowKey(event: KeyboardEvent<HTMLTableRowElement>, submissionId: string) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void openDetail(submissionId);
    }
  }

  async function confirmDelete() {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError(undefined);
    try {
      await contactSubmissionsApi.delete(deleting.id);
      setSubmissions((items) => items.filter((item) => item.id !== deleting.id));
      setFeedback(`Submission from ${deleting.name} deleted.`);
      setDeleting(undefined);
    } catch (caught) {
      setDeleteError(contactSubmissionErrorMessage(caught, "delete this Contact Submission"));
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Contact Submissions"
        description="Read and permanently delete messages received through the public contact form."
      />

      {feedback ? <p className={styles.feedback} role="status">{feedback}</p> : null}
      {loading ? (
        <div aria-label="Loading Contact Submissions" role="status">
          <div className={styles.skeleton} />
          <p className={styles.muted}>Loading Contact Submissions…</p>
        </div>
      ) : null}
      {!loading && error ? (
        <section className={styles.state} role="alert">
          <h2>Contact Submissions could not be loaded</h2>
          <p>{error}</p>
          <Button onClick={() => void load()} variant="secondary">Try again</Button>
        </section>
      ) : null}
      {!loading && !error && submissions.length === 0 ? (
        <section className={styles.state}>
          <h2>No contact submissions yet.</h2>
        </section>
      ) : null}
      {!loading && !error && submissions.length > 0 ? (
        <div className={styles.tableFrame}>
          <table className={styles.table}>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Company</th><th>Subject</th><th>Message</th><th>Source Page</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr
                  aria-label={`Open submission from ${submission.name}`}
                  className={styles.submissionRow}
                  key={submission.id}
                  onClick={() => void openDetail(submission.id)}
                  onKeyDown={(event) => handleRowKey(event, submission.id)}
                  tabIndex={0}
                >
                  <td>{submission.name}</td>
                  <td>{submission.email}</td>
                  <td>{submission.company || "—"}</td>
                  <td>{truncateText(submission.subject, 44)}</td>
                  <td>{truncateText(submission.message, 84)}</td>
                  <td>{truncateText(submission.source_page, 40)}</td>
                  <td>
                    <Button
                      aria-label={`Delete submission from ${submission.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setFeedback(undefined);
                        setDeleteError(undefined);
                        setDeleting(submission);
                      }}
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {selectedId ? (
        <SubmissionDetailDialog
          error={detailError}
          loading={detailLoading}
          onClose={() => setSelectedId(undefined)}
          submission={detail}
        />
      ) : null}
      {deleting ? (
        <ConfirmDelete
          busy={deleteBusy}
          error={deleteError}
          name={deleting.name}
          onCancel={() => setDeleting(undefined)}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}
    </div>
  );
}
