import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CaseStudyForm } from "@/features/case-studies/components/case-study-form";
import styles from "@/features/case-studies/components/case-studies.module.css";

export const metadata: Metadata = { title: "Create Case Study" };

export default function NewCaseStudyPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Create Case Study"
        description="Create the Case Study first, then upload its managed cover before publishing."
      />
      <CaseStudyForm />
    </div>
  );
}
