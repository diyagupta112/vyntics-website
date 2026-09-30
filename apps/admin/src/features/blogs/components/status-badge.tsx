import type { BlogStatus } from "../types";
import styles from "./blogs.module.css";

export function StatusBadge({ status }: { status: BlogStatus }) {
  return <span className={`${styles.badge} ${status === "published" ? styles.badgePublished : ""}`}>{status}</span>;
}
