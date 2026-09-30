import type { Metadata } from "next";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Dashboard",
};

const overviewAreas = [
  {
    title: "Content overview",
    description: "Blog and case study summaries will appear here when API integration is implemented.",
  },
  {
    title: "Operations overview",
    description: "Career and application summaries will use approved backend data in a later phase.",
  },
  {
    title: "Inbox overview",
    description: "Contact activity will appear here after its feature integration is complete.",
  },
] as const;

export default function DashboardPage() {
  return (
    <div className={styles.dashboard}>
      <PageHeader
        title="Dashboard"
        description="The administrative workspace foundation is ready for authenticated data in later phases."
      />

      <section aria-labelledby="overview-heading" className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2 id="overview-heading">Overview</h2>
          <p>No metrics are shown until supported data sources are connected.</p>
        </div>

        <div className={styles.cardGrid} data-testid="dashboard-overview-grid">
          {overviewAreas.map((area) => (
            <Card key={area.title}>
              <h3>{area.title}</h3>
              <p>{area.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
