import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CareerForm } from "@/features/careers/components/career-form";
import styles from "@/features/careers/components/careers.module.css";

export const metadata: Metadata = { title: "Create Career" };

export default function NewCareerPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Create Career"
        description="Add a current role using the fields supported by the Careers API."
      />
      <CareerForm />
    </div>
  );
}
