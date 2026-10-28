"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { contentErrorMessage } from "@/components/content-management/errors";
import { faqsApi } from "../api/faqs";
import type { FAQ } from "../types";
import { faqPageChoices, faqPageLabel, faqSubPageChoices, faqSubPageLabel } from "../lib/page-options";
import { ServiceFilter } from "@/components/forms/service-filter";
import styles from "@/components/content-management/content-management.module.css";

export function FAQList() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);
  const [page, setPage] = useState("");
  const [subPage, setSubPage] = useState("");
  const [knownPages, setKnownPages] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<FAQ>();
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    faqsApi.list(page || undefined, controller.signal, subPage || undefined).then(items => {
      if (!active) return;
      setItems(items);
      setKnownPages(current => [...new Set([...current, ...items.map(item => item.page)])]);
    }).catch((caught: unknown) => { if (active) setError(contentErrorMessage(caught, "faqs", "load faqs")); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [page, subPage, reload]);
  function retry() { setLoading(true); setError(undefined); setReload(current => current + 1); }
  async function confirmDelete() {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true); setDeleteError(undefined);
    try {
      await faqsApi.delete(deleting.id);
      setItems(current => current.filter(item => item.id !== deleting.id));
      setDeleting(undefined);
    } catch (caught) { setDeleteError(contentErrorMessage(caught, "faqs", "delete this faq")); }
    finally { setDeleteBusy(false); }
  }
  return <div className={styles.page}>
    <PageHeader title="FAQs" description="Manage questions and answers for each website page." actions={<Link className={styles.primaryLink} href="/faqs/new">+ Create FAQ</Link>} />
    <ServiceFilter idPrefix="faq" parentLabel="Page" childLabel="Sub-page" allParents="All Pages" allChildren="All Sub-pages" parents={faqPageChoices([...knownPages, page])} childOptions={(selected) => faqSubPageChoices(selected, selected === page ? subPage : "")} parent={page} child={subPage} onChange={(nextPage, nextSub) => {
      if (nextPage === page && nextSub === subPage) return;
      setLoading(true); setError(undefined); setPage(nextPage); setSubPage(nextSub);
    }} />
    {loading ? <div role="status" aria-label="Loading FAQs"><div className={styles.grid}><div className={styles.skeleton} /><div className={styles.skeleton} /></div><p className={styles.muted}>Loading FAQs…</p></div> : null}
    {!loading && error ? <section className={styles.state} role="alert"><h2>Unable to load faqs.</h2><p>{error}</p><Button onClick={retry} variant="secondary">Try Again</Button></section> : null}
    {!loading && !error && !items.length ? <section className={styles.state}><h2>{page ? `No FAQs for ${faqPageLabel(page)}${subPage ? ` / ${faqSubPageLabel(page, subPage)}` : ""}.` : "No FAQs yet."}</h2><p>{page ? "Create the first question and answer for this page." : "Create the first FAQ and choose its website page."}</p><Link className={styles.primaryLink} href="/faqs/new">Create FAQ</Link></section> : null}
    {!loading && !error && items.length ? <div className={styles.grid}>{items.map(item => <article className={styles.card} key={item.id}>
        <p className={styles.pageLabel}>{faqPageLabel(item.page)}{item.sub_page ? ` / ${faqSubPageLabel(item.page, item.sub_page)}` : ""}</p>
      <div className={styles.cardHeader}><h2>{item.question}</h2><span className={`${styles.badge} ${item.is_active ? styles.active : styles.inactive}`}>{item.is_active ? "Active" : "Inactive"}</span></div>
      <p className={styles.preview}>{item.answer}</p>
      <p className={styles.muted}>Display order {item.display_order} on this page</p>
      <div className={styles.cardActions}><Link className={styles.secondaryLink} href={`/faqs/${encodeURIComponent(item.id)}/edit`} aria-label={`Edit ${item.question}`}>Edit</Link><Button variant="destructive" aria-label={`Delete ${item.question}`} onClick={() => { setDeleteError(undefined); setDeleting(item); }}>Delete</Button></div>
    </article>)}</div> : null}
    {deleting ? <DeleteConfirmationDialog description="This FAQ will be permanently deleted. This action cannot be undone." busy={deleteBusy} itemName={deleting.question} resourceLabel="FAQ" error={deleteError} onCancel={() => setDeleting(undefined)} onConfirm={() => void confirmDelete()} /> : null}
  </div>;
}
