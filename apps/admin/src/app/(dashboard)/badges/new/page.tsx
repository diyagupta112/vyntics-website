import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { BadgeCreateWizard } from "@/features/badges/components/badge-create-wizard";
import styles from "@/features/badges/components/badges.module.css";
export const metadata: Metadata = { title: "Create Badge" };
export default function NewBadgePage() { return <div className={styles.page}><PageHeader title="Create Badge" description="Add the badge details first, then upload an optional logo." /><BadgeCreateWizard /></div>; }
