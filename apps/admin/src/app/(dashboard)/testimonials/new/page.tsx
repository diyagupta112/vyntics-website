import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { TestimonialForm } from "@/features/testimonials/components/testimonial-form";
import styles from "@/components/content-management/content-management.module.css";
export const metadata: Metadata = { title: "Create Testimonial" };
export default function Page() { return <div className={styles.page}><PageHeader title="Create Testimonial" description="Add a customer quote and its attribution." /><TestimonialForm /></div>; }
