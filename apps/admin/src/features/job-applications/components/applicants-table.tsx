"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { jobApplicationsApi } from "../api/job-applications";
import { applicationErrorMessage } from "../lib/errors";
import type { JobApplicationDetail, JobApplicationListItem } from "../types";
import { ApplicationDetail } from "./application-detail";
import { ConfirmDelete } from "./confirm-delete";
import { StatusBadge } from "./status-badge";
import styles from "./job-applications.module.css";

type Props = {
  applications: JobApplicationListItem[];
  onRemoved: (applicationId: string) => void;
  onUpdated: (detail: JobApplicationDetail) => void;
};

export function ApplicantsTable({ applications, onRemoved, onUpdated }: Props) {
  const [expandedId, setExpandedId] = useState<string>();
  const [details, setDetails] = useState<Record<string, JobApplicationDetail>>({});
  const [detailLoading, setDetailLoading] = useState<string>();
  const [detailError, setDetailError] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<JobApplicationListItem>();
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();

  async function toggle(application: JobApplicationListItem) {
    if (expandedId === application.id) {
      setExpandedId(undefined);
      return;
    }
    setExpandedId(application.id);
    if (details[application.id] || detailLoading === application.id) return;
    setDetailLoading(application.id);
    setDetailError((current) => ({ ...current, [application.id]: "" }));
    try {
      const detail = await jobApplicationsApi.get(application.id);
      setDetails((current) => ({ ...current, [application.id]: detail }));
    } catch (caught) {
      setDetailError((current) => ({
        ...current,
        [application.id]: applicationErrorMessage(caught, "load applicant details"),
      }));
    } finally {
      setDetailLoading(undefined);
    }
  }

  function updateDetail(detail: JobApplicationDetail) {
    setDetails((current) => ({ ...current, [detail.id]: detail }));
    onUpdated(detail);
  }

  async function confirmDelete() {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError(undefined);
    try {
      await jobApplicationsApi.delete(deleting.id);
      onRemoved(deleting.id);
      setExpandedId(undefined);
      setDeleting(undefined);
    } catch (caught) {
      setDeleteError(applicationErrorMessage(caught, "delete this Job Application"));
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <div className={styles.tableFrame}>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Status</th><th>Resume</th><th>Details</th></tr></thead>
          <tbody>
            {applications.map((application) => {
              const expanded = expandedId === application.id;
              const detailId = `application-detail-${application.id}`;
              return (
                <FragmentRows
                  application={application}
                  detail={details[application.id]}
                  detailError={detailError[application.id]}
                  detailId={detailId}
                  expanded={expanded}
                  loading={detailLoading === application.id}
                  onDelete={() => setDeleting(application)}
                  onToggle={() => void toggle(application)}
                  onUpdated={updateDetail}
                  key={application.id}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      {deleting ? <ConfirmDelete applicantName={deleting.name} busy={deleteBusy} error={deleteError} onCancel={() => setDeleting(undefined)} onConfirm={() => void confirmDelete()} /> : null}
    </>
  );
}

type RowProps = {
  application: JobApplicationListItem;
  detail?: JobApplicationDetail;
  detailError?: string;
  detailId: string;
  expanded: boolean;
  loading: boolean;
  onDelete: () => void;
  onToggle: () => void;
  onUpdated: (detail: JobApplicationDetail) => void;
};

function FragmentRows({ application, detail, detailError, detailId, expanded, loading, onDelete, onToggle, onUpdated }: RowProps) {
  return (
    <>
      <tr className={styles.applicationRow}>
        <td data-label="Name">{application.name}</td>
        <td data-label="Email"><a className={styles.textLink} href={`mailto:${application.email}`}>{application.email}</a></td>
        <td data-label="Mobile">{application.phone}</td>
        <td data-label="Status"><StatusBadge status={application.status} /></td>
        <td data-label="Resume">
          {application.resume_url ? (
            <a aria-label={`View resume for ${application.name}`} className={styles.textLink} href={application.resume_url} onClick={(event) => event.stopPropagation()} rel="noreferrer" target="_blank">View resume</a>
          ) : <span className={styles.muted}>No resume</span>}
        </td>
        <td data-label="Details">
          <Button aria-controls={detailId} aria-expanded={expanded} aria-label={`${expanded ? "Hide" : "Show"} details for ${application.name}`} onClick={onToggle} variant="ghost">
            {expanded ? "Hide details" : "Details"}
          </Button>
        </td>
      </tr>
      {expanded ? (
        <tr className={styles.expandedRow} id={detailId}>
          <td colSpan={6}>
            {loading ? <p role="status">Loading applicant details…</p> : null}
            {detailError ? <p role="alert">{detailError}</p> : null}
            {detail ? <ApplicationDetail detail={detail} onDelete={onDelete} onUpdated={onUpdated} /> : null}
          </td>
        </tr>
      ) : null}
    </>
  );
}
