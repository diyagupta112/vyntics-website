import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { LifeCreate } from "@/features/life-at-vyntics/components/life-create";
import styles from "@/features/life-at-vyntics/components/life-at-vyntics.module.css";
export const metadata: Metadata = { title: "Add Life at Vyntics Image" };
export default function NewLifeAtVynticsPage() { return <div className={styles.page}><PageHeader title="Add Image" description="Choose an image and where it should appear in the gallery." /><LifeCreate /></div>; }
