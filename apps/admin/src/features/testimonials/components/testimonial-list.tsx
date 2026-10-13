"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { contentErrorMessage } from "@/components/content-management/errors";
import { testimonialsApi } from "../api/testimonials";
import type { Testimonial } from "../types";
import styles from "@/components/content-management/content-management.module.css";

export function TestimonialList() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);
  const [deleting, setDeleting] = useState<Testimonial>();
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    testimonialsApi.list(controller.signal).then(items => {
      if (!active) return;
      setItems(items);
    }).catch((caught: unknown) => { if (active) setError(contentErrorMessage(caught, "testimonials", "load testimonials")); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [reload]);
  function retry() { setLoading(true); setError(undefined); setReload(current => current + 1); }
  async function confirmDelete() {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true); setDeleteError(undefined);
    try {
      await testimonialsApi.delete(deleting.id);
      setItems(current => current.filter(item => item.id !== deleting.id));
      setDeleting(undefined);
    } catch (caught) { setDeleteError(contentErrorMessage(caught, "testimonials", "delete this testimonial")); }
    finally { setDeleteBusy(false); }
  }
  return <div className={styles.page}>
    <PageHeader title="Testimonials" description="Manage customer quotes and their public visibility." actions={<Link className={styles.primaryLink} href="/testimonials/new">+ Create Testimonial</Link>} />
    {loading ? <div role="status" aria-label="Loading Testimonials"><div className={styles.grid}><div className={styles.skeleton} /><div className={styles.skeleton} /></div><p className={styles.muted}>Loading Testimonials…</p></div> : null}
    {!loading && error ? <section className={styles.state} role="alert"><h2>Unable to load testimonials.</h2><p>{error}</p><Button onClick={retry} variant="secondary">Try Again</Button></section> : null}
    {!loading && !error && !items.length ? <section className={styles.state}><h2>No testimonials yet.</h2><p>Add the first customer testimonial to get started.</p><Link className={styles.primaryLink} href="/testimonials/new">Create Testimonial</Link></section> : null}
    {!loading && !error && items.length ? <div className={styles.grid}>{items.map(item => <article className={styles.card} key={item.id}>
      <div className={styles.cardHeader}><h2>{item.author_name}</h2><span className={`${styles.badge} ${item.is_active ? styles.active : styles.inactive}`}>{item.is_active ? "Active" : "Inactive"}</span></div>
      <p className={styles.muted}>{[item.author_role, item.company_name].filter(Boolean).join(" · ") || "Customer testimonial"}</p>
      <blockquote className={styles.preview}>{item.quote}</blockquote>
      <p className={styles.muted}>Display order {item.display_order}</p>
      <div className={styles.cardActions}><Link className={styles.secondaryLink} href={`/testimonials/${encodeURIComponent(item.id)}/edit`} aria-label={`Edit ${item.author_name}`}>Edit</Link><Button variant="destructive" aria-label={`Delete ${item.author_name}`} onClick={() => { setDeleteError(undefined); setDeleting(item); }}>Delete</Button></div>
    </article>)}</div> : null}
    {deleting ? <DeleteConfirmationDialog description="This testimonial will be permanently deleted. This action cannot be undone." busy={deleteBusy} itemName={deleting.author_name} resourceLabel="Testimonial" error={deleteError} onCancel={() => setDeleting(undefined)} onConfirm={() => void confirmDelete()} /> : null}
  </div>;
}
