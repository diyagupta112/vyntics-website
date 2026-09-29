import type { Metadata } from "next";
import { Suspense } from "react";
import { JobApplicationsOverview } from "@/features/job-applications/components/job-applications-overview";
import styles from "@/features/job-applications/components/job-applications.module.css";

export const metadata: Metadata = { title: "Job Applications" };

export default function JobApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div aria-label="Loading Job Applications" className={styles.page} role="status">
          <div className={styles.skeleton} />
          <p>Loading Job Applications…</p>
        </div>
      }
    >
      <JobApplicationsOverview />
    </Suspense>
  );
}
