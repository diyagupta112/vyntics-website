"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { careersApi } from "@/features/careers/api/careers";
import type { CareerListItem } from "@/features/careers/types";
import { jobApplicationsApi } from "../api/job-applications";
import { applicationErrorMessage } from "../lib/errors";
import type { JobApplicationDetail, JobApplicationListItem } from "../types";
import { ApplicantsTable } from "./applicants-table";
import styles from "./job-applications.module.css";

export function JobApplicationsOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCareerId = searchParams.get("careerId");
  const [careers, setCareers] = useState<CareerListItem[]>([]);
  const [applications, setApplications] = useState<JobApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const selectedCareer = useMemo(
    () => careers.find((career) => career.id === requestedCareerId),
    [careers, requestedCareerId],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const [careerItems, applicationItems] = await Promise.all([
        careersApi.list(),
        requestedCareerId
          ? jobApplicationsApi.listForCareer(requestedCareerId)
          : jobApplicationsApi.listAll(),
      ]);
      setCareers(careerItems);
      setApplications(applicationItems);
    } catch (caught) {
      setError(applicationErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [requestedCareerId]);

  useEffect(() => {
    let active = true;
    Promise.all([
      careersApi.list(),
      requestedCareerId
        ? jobApplicationsApi.listForCareer(requestedCareerId)
        : jobApplicationsApi.listAll(),
    ])
      .then(([careerItems, applicationItems]) => {
        if (!active) return;
        setCareers(careerItems);
        setApplications(applicationItems);
      })
      .catch((caught: unknown) => {
        if (active) setError(applicationErrorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [requestedCareerId]);

  function selectCareer(careerId?: string) {
    setLoading(true);
    setError(undefined);
    router.replace(
      careerId
        ? `/job-applications?careerId=${encodeURIComponent(careerId)}`
        : "/job-applications",
    );
  }

  function updateApplication(detail: JobApplicationDetail) {
    setApplications((items) =>
      items.map((item) => (item.id === detail.id ? detail : item)),
    );
  }

  const scopeName = requestedCareerId
    ? selectedCareer?.title ?? "Selected Career"
    : "All Applicants";

  return (
    <div className={styles.page}>
      <PageHeader
        title="Job Applications"
        description="Review applicants, update administrative status and notes, and access private resumes."
        actions={<button aria-pressed={!requestedCareerId} className={styles.headerAction} onClick={() => selectCareer()} type="button">All Applicants</button>}
      />

      <section aria-labelledby="application-scope-heading" className={styles.scopeSection}>
        <div className={styles.sectionHeading}>
          <h2 id="application-scope-heading">Choose applicant scope</h2>
          <p>View every application or focus on one currently available role.</p>
        </div>
        <div aria-label="Career applicant scopes" className={styles.careerScopes}>
          {careers.map((career) => (
            <button
              aria-pressed={requestedCareerId === career.id}
              className={`${styles.careerScope} ${requestedCareerId === career.id ? styles.selectedScope : ""}`}
              key={career.id}
              onClick={() => selectCareer(career.id)}
              type="button"
            >
              {career.title}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="current-scope-heading" className={styles.resultsSection}>
        <div className={styles.scopeHeading}>
          <div>
            <p className={styles.eyebrow}>Current scope</p>
            <h2 id="current-scope-heading">{scopeName}</h2>
          </div>
          {!loading && !error ? <span className={styles.count}>{applications.length} application{applications.length === 1 ? "" : "s"}</span> : null}
        </div>

        {loading ? (
          <div aria-label="Loading Job Applications" role="status">
            <div className={styles.skeleton} />
            <p className={styles.muted}>Loading Job Applications…</p>
          </div>
        ) : null}

        {!loading && error ? (
          <div className={styles.errorState} role="alert">
            <h3>Job Applications could not be loaded</h3>
            <p>{error}</p>
            <Button onClick={() => void load()} variant="secondary">Try again</Button>
          </div>
        ) : null}

        {!loading && !error && applications.length === 0 ? (
          <div className={styles.empty}>
            <h3>{requestedCareerId ? `No applications for ${scopeName}` : "No applications yet"}</h3>
            <p>{requestedCareerId ? "No one has applied for this Career yet." : "Applications will appear here after candidates submit them."}</p>
          </div>
        ) : null}

        {!loading && !error && applications.length > 0 ? (
          <ApplicantsTable
            applications={applications}
            onRemoved={(applicationId) => setApplications((items) => items.filter((item) => item.id !== applicationId))}
            onUpdated={updateApplication}
          />
        ) : null}
      </section>
    </div>
  );
}
