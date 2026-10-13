import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { FAQForm } from "@/features/faqs/components/faq-form";
import styles from "@/components/content-management/content-management.module.css";
export const metadata: Metadata = { title: "Create FAQ" };
export default function Page() { return <div className={styles.page}><PageHeader title="Create FAQ" description="Add a question and answer for a website page." /><FAQForm /></div>; }
