import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { DashboardOverview } from "./dashboard-overview";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className={styles.dashboard}>
      <PageHeader
        title="Dashboard"
        description="Monitor content, hiring, people, and incoming requests."
      />
      <DashboardOverview />
    </div>
  );
}
