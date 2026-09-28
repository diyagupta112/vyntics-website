"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { blogsApi } from "../api/blogs";
import { blogErrorMessage } from "../lib/errors";
import type { Blog } from "../types";
import { BlogForm } from "./blog-form";
import { CoverImageControl } from "./cover-image-control";
import styles from "./blogs.module.css";

export function BlogEditor({ blogId }: { blogId: string }) {
  const [blog, setBlog] = useState<Blog>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const load = useCallback(async (showLoading = true) => {
    if (showLoading) { setLoading(true); setError(undefined); }
    try { setBlog(await blogsApi.get(blogId)); }
    catch (caught) { setError(blogErrorMessage(caught, "load this Blog")); }
    finally { setLoading(false); }
  }, [blogId]);
  useEffect(() => {
    let active = true;
    blogsApi.get(blogId)
      .then((item) => { if (active) setBlog(item); })
      .catch((caught: unknown) => { if (active) setError(blogErrorMessage(caught, "load this Blog")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [blogId]);
  if (loading) return <div className={styles.page} aria-label="Loading Blog" role="status"><div className={styles.skeleton} /><p>Loading Blog…</p></div>;
  if (error || !blog) return <section className={styles.errorState} role="alert"><h1>Blog unavailable</h1><p>{error ?? "This Blog could not be loaded."}</p><div className={styles.actions}><Button onClick={() => void load()} variant="secondary">Try again</Button><Link className={styles.linkButton} href="/blogs">Back to Blogs</Link></div></section>;
  return <div className={styles.page}><PageHeader title={`Edit ${blog.title}`} description="Update content, publication status, and the managed cover image." actions={<Link className={styles.linkButton} href="/blogs">Back to Blogs</Link>} /><BlogForm blog={blog} onSaved={setBlog} /><CoverImageControl blog={blog} onChanged={setBlog} /></div>;
}
