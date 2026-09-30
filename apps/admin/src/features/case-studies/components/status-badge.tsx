import type { CaseStudyStatus } from "../types";
import styles from "./case-studies.module.css";

export function StatusBadge({ status }: { status: CaseStudyStatus }) {
  return (
    <span
      className={`${styles.badge} ${
        status === "published" ? styles.badgePublished : ""
      }`}
    >
      {status}
    </span>
  );
}
