"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { jobApplicationsApi } from "../api/job-applications";
import { applicationErrorMessage } from "../lib/errors";
import type { JobApplicationDetail, JobApplicationListItem } from "../types";
import { ApplicantDetailDialog } from "./applicant-detail-dialog";
import { ConfirmDelete } from "./confirm-delete";
import { StatusBadge } from "./status-badge";
import styles from "./job-applications.module.css";

type Props = {
  applications: JobApplicationListItem[];
  onRemoved: (applicationId: string) => void;
  onUpdated: (detail: JobApplicationDetail) => void;
};

export function ApplicantsTable({ applications, onRemoved, onUpdated }: Props) {
  const [selected, setSelected] = useState<JobApplicationListItem>();
  const [details, setDetails] = useState<Record<string, JobApplicationDetail>>({});
  const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>({});
  const [detailError, setDetailError] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<JobApplicationListItem>();
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const detailsTriggerRef = useRef<HTMLButtonElement | null>(null);

  async function loadDetail(application: JobApplicationListItem, force = false) {
    if ((!force && details[application.id]) || detailLoading[application.id]) return;
    setDetailLoading((current) => ({ ...current, [application.id]: true }));
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
      setDetailLoading((current) => ({ ...current, [application.id]: false }));
    }
  }

  function openDetails(application: JobApplicationListItem, trigger: HTMLButtonElement) {
    detailsTriggerRef.current = trigger;
    setSelected(application);
    void loadDetail(application);
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
      setSelected(undefined);
      setDetails((current) => {
        const next = { ...current };
        delete next[deleting.id];
        return next;
      });
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
            {applications.map((application) => (
              <ApplicationRow
                application={application}
                key={application.id}
                onOpen={(trigger) => openDetails(application, trigger)}
              />
            ))}
          </tbody>
        </table>
      </div>
      {selected ? (
        <ApplicantDetailDialog
          application={selected}
          detail={details[selected.id]}
          error={detailError[selected.id]}
          loading={Boolean(detailLoading[selected.id])}
          onClose={() => setSelected(undefined)}
          onDelete={() => setDeleting(details[selected.id] ?? selected)}
          onRetry={() => void loadDetail(selected, true)}
          onUpdated={updateDetail}
          returnFocusTo={detailsTriggerRef.current}
        />
      ) : null}
      {deleting ? <ConfirmDelete applicantName={deleting.name} busy={deleteBusy} error={deleteError} onCancel={() => setDeleting(undefined)} onConfirm={() => void confirmDelete()} /> : null}
    </>
  );
}

type RowProps = {
  application: JobApplicationListItem;
  onOpen: (trigger: HTMLButtonElement) => void;
};

function ApplicationRow({ application, onOpen }: RowProps) {
  return (
    <tr className={styles.applicationRow}>
      <td data-label="Name">{application.name}</td>
      <td data-label="Email"><a className={styles.textLink} href={`mailto:${application.email}`} onClick={(event) => event.stopPropagation()}>{application.email}</a></td>
      <td data-label="Mobile">{application.phone}</td>
      <td data-label="Status"><StatusBadge status={application.status} /></td>
      <td data-label="Resume">
        {application.resume_url ? (
          <a aria-label={`View resume for ${application.name}`} className={styles.textLink} href={application.resume_url} onClick={(event) => event.stopPropagation()} rel="noreferrer" target="_blank">View resume</a>
        ) : <span className={styles.muted}>No resume</span>}
      </td>
      <td data-label="Details">
        <Button aria-haspopup="dialog" aria-label={`View details for ${application.name}`} onClick={(event) => onOpen(event.currentTarget)} variant="ghost">
          Details
        </Button>
      </td>
    </tr>
  );
}
