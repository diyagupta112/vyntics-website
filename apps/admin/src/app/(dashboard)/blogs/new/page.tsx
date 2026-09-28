import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { BlogForm } from "@/features/blogs/components/blog-form";
import styles from "@/features/blogs/components/blogs.module.css";
export const metadata: Metadata = { title: "Create Blog" };
export default function NewBlogPage() { return <div className={styles.page}><PageHeader title="Create Blog" description="Create the Blog first, then upload its managed cover before publishing." /><BlogForm /></div>; }
