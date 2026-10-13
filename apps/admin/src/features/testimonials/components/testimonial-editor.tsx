"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { contentErrorMessage } from "@/components/content-management/errors";
import { testimonialsApi } from "../api/testimonials";
import type { Testimonial } from "../types";
import { TestimonialForm } from "./testimonial-form";
import styles from "@/components/content-management/content-management.module.css";

export function TestimonialEditor({ id }: { id: string }) {
  const router = useRouter();
  const [item, setItem] = useState<Testimonial>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  useEffect(() => {
    let active = true;
    testimonialsApi.get(id).then(item => { if (active) setItem(item); }).catch((caught: unknown) => { if (active) setError(contentErrorMessage(caught, "testimonials", "load this testimonial")); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, reload]);
  async function remove() {
    if (!item || deleteBusy) return;
    setDeleteBusy(true); setDeleteError(undefined);
    try { await testimonialsApi.delete(item.id); router.push("/testimonials?deleted=1"); }
    catch (caught) { setDeleteError(contentErrorMessage(caught, "testimonials", "delete this testimonial")); }
    finally { setDeleteBusy(false); }
  }
  if (loading) return <div className={styles.page} role="status" aria-label="Loading Testimonial"><div className={styles.skeleton} /><p>Loading Testimonial…</p></div>;
  if (error || !item) return <section className={styles.state} role="alert"><h1>Testimonial unavailable</h1><p>{error ?? "This record could not be loaded."}</p><div className={styles.actions}><Button variant="secondary" onClick={() => { setLoading(true); setError(undefined); setReload(current => current + 1); }}>Try Again</Button><Link className={styles.secondaryLink} href="/testimonials">Back to Testimonials</Link></div></section>;
  return <div className={styles.page}>
    <PageHeader title={item.author_name} description="Update the customer quote, attribution, order, and visibility." actions={<><Link className={styles.secondaryLink} href="/testimonials">Back to Testimonials</Link><Button variant="destructive" onClick={() => { setDeleteError(undefined); setConfirming(true); }}>Delete Permanently</Button></>} />
    <TestimonialForm key={item.id} item={item} onSaved={setItem} />
    {confirming ? <DeleteConfirmationDialog description="This testimonial will be permanently deleted. This action cannot be undone." busy={deleteBusy} itemName={item.author_name} resourceLabel="Testimonial" error={deleteError} onCancel={() => setConfirming(false)} onConfirm={() => void remove()} /> : null}
  </div>;
}
