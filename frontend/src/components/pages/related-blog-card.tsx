"use client";

import { useState } from "react";
import Link from "next/link";
import type { Blog } from "@/lib/blogs";
import styles from "./related-blog-card.module.css";
import studyStyles from "@/app/(marketing)/case-studies/page.module.css";

export function RelatedBlogCard({ blog, variant = "sidebar" }: { blog: Blog; variant?: "sidebar" | "service" }) {
  const [failed, setFailed] = useState(false);
  const hasImage = /^(https?:\/\/|\/)/.test(blog.cover_image_url) && !failed;
  if (variant === "service") return (
    <Link className={studyStyles.otherCard} href={`/blog/${encodeURIComponent(blog.slug)}`}>
      <div className={studyStyles.otherMedia}>
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={blog.cover_image_url} alt="" width="960" height="540" loading="lazy" onError={() => setFailed(true)} />
        ) : <div role="img" aria-label={`${blog.title} — cover unavailable`} style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--color-muted)", fontSize: ".8rem" }}>Article preview unavailable</div>}
      </div>
      <div className={studyStyles.otherCopy}>
        <p>{blog.category && <>{blog.category} · </>}<time dateTime={blog.published_at}>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(blog.published_at))}</time></p>
        <h3>{blog.title}</h3>
        <span>{blog.excerpt}</span>
        <strong>Read article <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg></strong>
      </div>
    </Link>
  );
  return <Link className={styles.card} href={`/blog/${encodeURIComponent(blog.slug)}`}>
    <div className={styles.image}>{hasImage ? (
      // Cover hosts are supplied by the backend.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={blog.cover_image_url} alt="" loading="lazy" onError={() => setFailed(true)} />
    ) : <span>VYNTICS</span>}</div>
    <div className={styles.copy}><span className={styles.category}>{blog.category}</span><strong>{blog.title}</strong><p className={styles.excerpt}>{blog.excerpt}</p><span className={styles.read}>{blog.read_time} min read <span aria-hidden="true">↗</span></span></div>
  </Link>;
}
