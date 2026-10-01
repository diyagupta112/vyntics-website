import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { BlogCreateWizard } from "@/features/blogs/components/blog-create-wizard";
import styles from "@/features/blogs/components/blogs.module.css";
export const metadata: Metadata = { title: "Create Blog" };
export default function NewBlogPage() { return <div className={styles.page}><PageHeader title="Create Blog" description="Complete the content first, then add the cover image." /><BlogCreateWizard /></div>; }
