import type { JobApplicationStatus } from "../types";
import styles from "./job-applications.module.css";

export function StatusBadge({ status }: { status: JobApplicationStatus }) {
  return <span className={styles.badge}>{status}</span>;
}
