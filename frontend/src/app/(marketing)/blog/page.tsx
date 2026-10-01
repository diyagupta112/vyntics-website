import type { Metadata } from "next";
import { getBlogs } from "@/lib/blogs";
import { BlogListing } from "@/components/pages/blog-listing";

export const metadata: Metadata = { title: "Blog", description: "Practical guides and perspectives from Vyntics on AI, data engineering, analytics, and cloud systems." };

export default async function BlogPage() {
  const result = await getBlogs();
  return <BlogListing blogs={result.blogs} unavailable={result.status === "error"} />;
}
