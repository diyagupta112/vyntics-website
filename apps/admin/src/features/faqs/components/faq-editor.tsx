"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { contentErrorMessage } from "@/components/content-management/errors";
import { faqsApi } from "../api/faqs";
import type { FAQ } from "../types";
import { FAQForm } from "./faq-form";
import styles from "@/components/content-management/content-management.module.css";

export function FAQEditor({ id }: { id: string }) {
  const router = useRouter();
  const [item, setItem] = useState<FAQ>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  useEffect(() => {
    let active = true;
    faqsApi.get(id).then(item => { if (active) setItem(item); }).catch((caught: unknown) => { if (active) setError(contentErrorMessage(caught, "faqs", "load this faq")); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, reload]);
  async function remove() {
    if (!item || deleteBusy) return;
    setDeleteBusy(true); setDeleteError(undefined);
    try { await faqsApi.delete(item.id); router.push("/faqs?deleted=1"); }
    catch (caught) { setDeleteError(contentErrorMessage(caught, "faqs", "delete this faq")); }
    finally { setDeleteBusy(false); }
  }
  if (loading) return <div className={styles.page} role="status" aria-label="Loading FAQ"><div className={styles.skeleton} /><p>Loading FAQ…</p></div>;
  if (error || !item) return <section className={styles.state} role="alert"><h1>FAQ unavailable</h1><p>{error ?? "This record could not be loaded."}</p><div className={styles.actions}><Button variant="secondary" onClick={() => { setLoading(true); setError(undefined); setReload(current => current + 1); }}>Try Again</Button><Link className={styles.secondaryLink} href="/faqs">Back to FAQs</Link></div></section>;
  return <div className={styles.page}>
    <PageHeader title={item.question} description="Update the page association, answer, order, and visibility." actions={<><Link className={styles.secondaryLink} href="/faqs">Back to FAQs</Link><Button variant="destructive" onClick={() => { setDeleteError(undefined); setConfirming(true); }}>Delete Permanently</Button></>} />
    <FAQForm key={item.id} item={item} onSaved={setItem} />
    {confirming ? <DeleteConfirmationDialog description="This FAQ will be permanently deleted. This action cannot be undone." busy={deleteBusy} itemName={item.question} resourceLabel="FAQ" error={deleteError} onCancel={() => setConfirming(false)} onConfirm={() => void remove()} /> : null}
  </div>;
}
