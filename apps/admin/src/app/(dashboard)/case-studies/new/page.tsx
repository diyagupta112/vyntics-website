import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CaseStudyCreateWizard } from "@/features/case-studies/components/case-study-create-wizard";
import styles from "@/features/case-studies/components/case-studies.module.css";

export const metadata: Metadata = { title: "Create Case Study" };

export default function NewCaseStudyPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Create Case Study"
        description="Complete the content first, then add the cover image."
      />
      <CaseStudyCreateWizard />
    </div>
  );
}
