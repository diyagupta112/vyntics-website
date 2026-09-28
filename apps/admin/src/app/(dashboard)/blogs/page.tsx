import type { Metadata } from "next";
import { BlogList } from "@/features/blogs/components/blog-list";
export const metadata: Metadata = { title: "Blogs" };
export default function BlogsPage() { return <BlogList />; }
