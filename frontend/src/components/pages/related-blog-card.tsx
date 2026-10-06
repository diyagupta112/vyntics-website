"use client";

import { useState } from "react";
import Link from "next/link";
import type { Blog } from "@/lib/blogs";
import styles from "./related-blog-card.module.css";

export function RelatedBlogCard({ blog }: { blog: Blog }) {
  const [failed, setFailed] = useState(false);
  const hasImage = /^(https?:\/\/|\/)/.test(blog.cover_image_url) && !failed;
  return <Link className={styles.card} href={`/blog/${encodeURIComponent(blog.slug)}`}>
    <div className={styles.image}>{hasImage ? (
      // Cover hosts are supplied by the backend.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={blog.cover_image_url} alt="" loading="lazy" onError={() => setFailed(true)} />
    ) : <span>VYNTICS</span>}</div>
    <div className={styles.copy}><span className={styles.category}>{blog.category}</span><strong>{blog.title}</strong><p className={styles.excerpt}>{blog.excerpt}</p><span className={styles.read}>{blog.read_time} min read <span aria-hidden="true">↗</span></span></div>
  </Link>;
}
