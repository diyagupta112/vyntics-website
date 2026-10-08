import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import type { Blog } from "@/lib/blogs";
import { getBlogs } from "@/lib/blogs";
import { blogExtensions } from "@/content/blog-extensions";
import { RelatedBlogCard } from "@/components/pages/related-blog-card";
import type { JsonObject } from "@/lib/careers";
import { StructuredContent } from "@/components/sections/careers/structured-content";
import styles from "@/components/pages/blog-listing.module.css";
import articleStyles from "./page.module.css";

const getBlog = cache(async (slug: string) => {
  const base = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
  if (process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname)) {
    const preview = await fetch(`${base}/blogs/preview/all`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!preview.ok) throw new Error("Blog unavailable");
    const payload = await preview.json();
    return payload.data.find((post: Blog) => post.slug === slug) as (Blog & { content: JsonObject; seo_title: string; meta_description: string }) | undefined;
  }
  const response = await fetch(`${base}/blogs/${encodeURIComponent(slug)}`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Blog unavailable");
  return await response.json() as Blog & { content: JsonObject; seo_title: string; meta_description: string };
});
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try { const blog = await getBlog((await params).slug); return { title: blog?.seo_title ?? "Blog", description: blog?.meta_description }; }
  catch { return { title: "Blog" }; }
}
export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  let blog;
  try { blog = await getBlog((await params).slug); }
  catch { return <div className={styles.page}><div className={styles.empty}><h1>This article is temporarily unavailable.</h1><p>Please try again shortly.</p><Link href="/blog">Back to blogs</Link></div></div>; }
  if (!blog) notFound();
  const related = (await getBlogs()).blogs.filter((post) => post.slug !== blog.slug).slice(0, 3);
  const extensions = blogExtensions[blog.slug] ?? [];
  const bodyContent = blog.content.type ? blog.content : Object.fromEntries(Object.entries(blog.content).sort(([a], [b]) => {
    const order = (key: string) => key === "introduction" ? -1 : key === "conclusion" ? 1000 : 0;
    return order(a) - order(b);
  }));
  return <article><header className={articleStyles.hero}>{/^(https?:\/\/|\/)/.test(blog.cover_image_url) && (
    // Backend image hosts are dynamic.
    // eslint-disable-next-line @next/next/no-img-element
    <img className={articleStyles.cover} src={blog.cover_image_url} alt="" fetchPriority="high" />
  )}<div className={articleStyles.shade} /><div className={articleStyles.heroInner}><Link className={articleStyles.back} href="/blog">← All blogs</Link><div className={articleStyles.titleBlock}><p className={articleStyles.category}>{blog.category}</p><h1>{blog.title}</h1><a className={articleStyles.scroll} href="#article-content">Scroll to read <span aria-hidden="true">↓</span></a></div></div></header>
    <div id="article-content" className={articleStyles.readingLayout}>
      <aside className={articleStyles.leftSidebar} aria-label="About this article"><div className={articleStyles.infoCard}><p className={articleStyles.sideLabel}>ABOUT THIS ARTICLE</p><dl><div><dt>Author</dt><dd>{blog.author}</dd></div><div><dt>{blog.status && blog.status !== "published" ? "Created" : "Published"}</dt><dd><time dateTime={blog.published_at}>{new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(blog.published_at))}</time></dd></div><div><dt>Reading time</dt><dd>{blog.read_time} min read</dd></div><div><dt>Category</dt><dd>{blog.category}</dd></div></dl></div></aside>
      <section className={articleStyles.body} aria-label="Article content"><p className={articleStyles.excerpt}>{blog.excerpt}</p><StructuredContent value={bodyContent} />
        {extensions.map((section) => <section className={articleStyles.extraSection} key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.points && <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>}</section>)}
        <footer className={articleStyles.footer}><span>Written by {blog.author}</span><Link href="/blog">Explore more blogs →</Link></footer>
      </section>
      <aside className={articleStyles.rightSidebar} aria-label="More blogs"><nav className={articleStyles.infoCard}><h2>More blogs</h2>{related.map((post) => <RelatedBlogCard key={post.id} blog={post} />)}<Link className={articleStyles.allBlogs} href="/blog">View all blogs →</Link></nav></aside>
    </div></article>;
}
