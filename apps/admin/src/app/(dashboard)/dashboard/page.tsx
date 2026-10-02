import type { Metadata } from "next";

import { DashboardOverview } from "./dashboard-overview";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className={styles.dashboard}>
      <DashboardOverview />
    </div>
  );
}
