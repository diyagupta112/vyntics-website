"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { blogsApi } from "../api/blogs";
import { blogErrorMessage } from "../lib/errors";
import type { Blog } from "../types";
import { ConfirmDelete } from "./confirm-delete";
import { StatusBadge } from "./status-badge";
import styles from "./blogs.module.css";

export function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [deleting, setDeleting] = useState<Blog>();
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) { setLoading(true); setError(undefined); }
    try { setBlogs(await blogsApi.list()); }
    catch (caught) { setError(blogErrorMessage(caught)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    blogsApi.list()
      .then((items) => { if (active) setBlogs(items); })
      .catch((caught: unknown) => { if (active) setError(blogErrorMessage(caught)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function confirmDelete() {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true); setDeleteError(undefined);
    try {
      await blogsApi.delete(deleting.id);
      setBlogs((items) => items.filter((item) => item.id !== deleting.id));
      setDeleting(undefined);
    } catch (caught) { setDeleteError(blogErrorMessage(caught, "delete this Blog")); }
    finally { setDeleteBusy(false); }
  }

  return <div className={styles.page}>
    <PageHeader title="Blogs" description="Create, publish, and maintain Blog content." actions={<Link className={styles.linkButton} href="/blogs/new">Create Blog</Link>} />
    {loading ? <div aria-label="Loading Blogs" role="status"><div className={styles.skeleton} /><span className={styles.muted}>Loading Blogs…</span></div> : null}
    {!loading && error ? <section className={styles.errorState} role="alert"><h2>Blogs could not be loaded</h2><p>{error}</p><Button onClick={() => void load()} variant="secondary">Try again</Button></section> : null}
    {!loading && !error && blogs.length === 0 ? <section className={styles.empty}><h2>No Blog posts yet</h2><p>Create a draft to begin your first Blog.</p><Link className={styles.linkButton} href="/blogs/new">Create your first Blog</Link></section> : null}
    {!loading && !error && blogs.length > 0 ? <div className={styles.blogGrid}>{blogs.map((blog) => <article className={styles.blogCard} key={blog.id}>
      <Link aria-label={`Edit ${blog.title}`} className={styles.cardLink} href={`/blogs/${blog.id}/edit`}>
        {blog.cover_image_url ? <Image alt="" className={styles.cardImage} height={360} src={blog.cover_image_url} unoptimized width={640} /> : <div className={styles.imagePlaceholder}>No cover image</div>}
        <div className={styles.cardBody}>
          <div className={styles.cardTop}><span className={styles.category}>{blog.category}</span><span className={styles.cardIndicators}>{blog.is_featured ? <span className={styles.badge}>Featured</span> : null}<StatusBadge status={blog.status} /></span></div>
          <h2>{blog.title}</h2>
        </div>
      </Link>
      <div className={styles.cardActions}>
        <Button className={styles.deleteButton} aria-label={`Delete ${blog.title}`} onClick={() => { setDeleteError(undefined); setDeleting(blog); }} variant="destructive">Delete</Button>
      </div>
    </article>)}</div> : null}
    {deleting ? <ConfirmDelete blogTitle={deleting.title} busy={deleteBusy} error={deleteError} onCancel={() => setDeleting(undefined)} onConfirm={() => void confirmDelete()} /> : null}
  </div>;
}
