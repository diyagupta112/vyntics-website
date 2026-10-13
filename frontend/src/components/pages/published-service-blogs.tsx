import Link from "next/link";
import { getBlogs } from "@/lib/blogs";
import type { ServiceIdentifier } from "@/lib/related-services";

/** Keep the existing Data/AI insight-card presentation, using published API content. */
export async function PublishedServiceBlogs({ service, className }: { service: ServiceIdentifier; className: string }) {
  const result = await getBlogs(service);
  if (!result.blogs.length) return <p role="status">{result.status === "error" ? "Related insights are temporarily unavailable. Please try again later." : "Related insights will appear here when available."}</p>;
  return <div className={className}>{result.blogs.slice(0, 3).map(blog => <Link href={`/blog/${encodeURIComponent(blog.slug)}`} key={blog.id}>
    <span>{blog.category} · {blog.read_time} min read</span>
    <h3>{blog.title}</h3><p>{blog.excerpt}</p><strong>Read article <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg></strong>
  </Link>)}</div>;
}
