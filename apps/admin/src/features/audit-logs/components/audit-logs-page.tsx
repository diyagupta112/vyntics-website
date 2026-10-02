"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { auditLogsApi } from "../api/audit-logs";
import { auditLogErrorMessage } from "../lib/errors";
import type {
  AuditLogDetail,
  AuditLogFilters,
  AuditLogListItem,
  AuditLogPage,
} from "../types";
import { AuditLogDetailDialog } from "./audit-log-detail-dialog";
import styles from "./audit-logs.module.css";

type FilterForm = {
  action: string;
  from: string;
  resourceType: string;
  to: string;
};

const emptyFilterForm: FilterForm = {
  action: "",
  from: "",
  resourceType: "",
  to: "",
};

function readableLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toApiTimestamp(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

type DateTimeFilterInputProps = Readonly<{
  id: string;
  max?: string;
  min?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value: string;
}>;

function DateTimeFilterInput({ id, max, min, onChange, value }: DateTimeFilterInputProps) {
  return (
    <div className={styles.dateTimeControl}>
      <Input
        className={styles.dateTimeInput}
        data-empty={value ? undefined : "true"}
        id={id}
        max={max}
        min={min}
        onChange={onChange}
        type="datetime-local"
        value={value}
      />
      {value ? null : (
        <span aria-hidden="true" className={styles.dateTimePrompt}>
          Select date and time
        </span>
      )}
    </div>
  );
}

export function AuditLogsPage() {
  const [result, setResult] = useState<AuditLogPage>();
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [filterForm, setFilterForm] = useState<FilterForm>(emptyFilterForm);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [selectedId, setSelectedId] = useState<string>();
  const [detail, setDetail] = useState<AuditLogDetail>();
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string>();

  const requestPage = useCallback(
    (signal?: AbortSignal) =>
      auditLogsApi.list({ ...filters, page, pageSize, signal }),
    [filters, page, pageSize],
  );

  useEffect(() => {
    const controller = new AbortController();
    requestPage(controller.signal)
      .then((nextResult) => setResult(nextResult))
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) setError(auditLogErrorMessage(caught));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [requestPage]);

  async function retry() {
    setLoading(true);
    setError(undefined);
    try {
      setResult(await requestPage());
    } catch (caught) {
      setError(auditLogErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    setPage(1);
    setFilters({
      action: filterForm.action || undefined,
      resourceType: filterForm.resourceType || undefined,
      from: toApiTimestamp(filterForm.from),
      to: toApiTimestamp(filterForm.to),
    });
  }

  function clearFilters() {
    setLoading(true);
    setError(undefined);
    setFilterForm(emptyFilterForm);
    setFilters({});
    setPage(1);
  }

  async function openDetail(auditLogId: string) {
    setSelectedId(auditLogId);
    setDetail(undefined);
    setDetailError(undefined);
    setDetailLoading(true);
    try {
      setDetail(await auditLogsApi.get(auditLogId));
    } catch (caught) {
      setDetailError(auditLogErrorMessage(caught, "load this Audit Log"));
    } finally {
      setDetailLoading(false);
    }
  }

  function handleRowKey(
    event: KeyboardEvent<HTMLTableRowElement>,
    auditLogId: string,
  ) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void openDetail(auditLogId);
    }
  }

  const totalPages = Math.max(1, Math.ceil((result?.total ?? 0) / pageSize));
  const hasFilters = Object.values(filters).some(Boolean);
  const hasDraftFilters = Object.values(filterForm).some(Boolean);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Audit Logs"
        description="Review administrative activity recorded by the Vyntics backend."
      />

      <form
        aria-label="Audit Log filters"
        className={styles.filters}
        onSubmit={applyFilters}
      >
        <div className={styles.filterField}>
          <label htmlFor="audit-action">Action</label>
          <Select
            id="audit-action"
            onChange={(event) =>
              setFilterForm((current) => ({ ...current, action: event.target.value }))
            }
            value={filterForm.action}
          >
            <option value="">All actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </Select>
        </div>
        <div className={styles.filterField}>
          <label htmlFor="audit-resource-type">Resource type</label>
          <Select
            id="audit-resource-type"
            onChange={(event) =>
              setFilterForm((current) => ({
                ...current,
                resourceType: event.target.value,
              }))
            }
            value={filterForm.resourceType}
          >
            <option value="">All resources</option>
            <option value="blog">Blog</option>
            <option value="case_study">Case Study</option>
            <option value="career">Career</option>
            <option value="job_application">Job Application</option>
            <option value="team_member">Team Member</option>
            <option value="contact_submission">Contact Submission</option>
          </Select>
        </div>
        <div className={styles.filterField}>
          <label htmlFor="audit-from">From</label>
          <DateTimeFilterInput
            id="audit-from"
            max={filterForm.to || undefined}
            onChange={(event) =>
              setFilterForm((current) => ({ ...current, from: event.target.value }))
            }
            value={filterForm.from}
          />
        </div>
        <div className={styles.filterField}>
          <label htmlFor="audit-to">To</label>
          <DateTimeFilterInput
            id="audit-to"
            min={filterForm.from || undefined}
            onChange={(event) =>
              setFilterForm((current) => ({ ...current, to: event.target.value }))
            }
            value={filterForm.to}
          />
        </div>
        <div className={styles.filterActions}>
          <Button type="submit">Apply filters</Button>
          <Button disabled={!hasFilters && !hasDraftFilters} onClick={clearFilters} variant="ghost">
            Clear
          </Button>
        </div>
      </form>

      {loading ? (
        <div aria-label="Loading Audit Logs" role="status">
          <div className={styles.skeleton} />
          <p className={styles.muted}>Loading Audit Logs…</p>
        </div>
      ) : null}

      {!loading && error ? (
        <section className={styles.state} role="alert">
          <h2>Audit Logs could not be loaded</h2>
          <p>{error}</p>
          <Button onClick={() => void retry()} variant="secondary">Try again</Button>
        </section>
      ) : null}

      {!loading && !error && result?.items.length === 0 ? (
        <section className={styles.state}>
          <h2>{hasFilters ? "No audit logs match these filters." : "No audit logs yet."}</h2>
          {hasFilters ? <Button onClick={clearFilters} variant="secondary">Clear filters</Button> : null}
        </section>
      ) : null}

      {!loading && !error && result && result.items.length > 0 ? (
        <>
          <div className={styles.tableFrame}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Admin / Actor</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Resource ID</th>
                  <th>Date / Time</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((auditLog: AuditLogListItem) => (
                  <tr
                    aria-label={`Open audit log ${auditLog.id}`}
                    className={styles.auditRow}
                    key={auditLog.id}
                    onClick={() => void openDetail(auditLog.id)}
                    onKeyDown={(event) => handleRowKey(event, auditLog.id)}
                    tabIndex={0}
                  >
                    <td data-label="Admin / Actor">
                      {auditLog.actor_email ?? "System / anonymous"}
                    </td>
                    <td data-label="Action">
                      <span className={styles.badge}>{readableLabel(auditLog.action)}</span>
                    </td>
                    <td data-label="Resource">{readableLabel(auditLog.resource_type)}</td>
                    <td data-label="Resource ID" className={styles.identifier}>
                      {auditLog.resource_id ?? "—"}
                    </td>
                    <td data-label="Date / Time">
                      <time dateTime={auditLog.created_at}>
                        {new Intl.DateTimeFormat(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(auditLog.created_at))}
                      </time>
                    </td>
                    <td data-label="Details">
                      <Button
                        aria-label={`View details for audit log ${auditLog.id}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          void openDetail(auditLog.id);
                        }}
                        variant="ghost"
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav aria-label="Audit Log pagination" className={styles.pagination}>
            <p>
              Page {page} of {totalPages} · {result.total} audit {result.total === 1 ? "log" : "logs"}
            </p>
            <label>
              Rows per page
              <Select
                aria-label="Rows per page"
                onChange={(event) => {
                  setLoading(true);
                  setError(undefined);
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                value={pageSize}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </label>
            <div className={styles.paginationActions}>
              <Button disabled={page <= 1} onClick={() => { setLoading(true); setError(undefined); setPage((current) => current - 1); }} variant="secondary">
                Previous
              </Button>
              <Button disabled={page >= totalPages} onClick={() => { setLoading(true); setError(undefined); setPage((current) => current + 1); }} variant="secondary">
                Next
              </Button>
            </div>
          </nav>
        </>
      ) : null}

      {selectedId ? (
        <AuditLogDetailDialog
          auditLog={detail}
          error={detailError}
          loading={detailLoading}
          onClose={() => setSelectedId(undefined)}
        />
      ) : null}
    </div>
  );
}
