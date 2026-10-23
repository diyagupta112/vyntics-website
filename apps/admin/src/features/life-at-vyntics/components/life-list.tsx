"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { lifeAtVynticsApi } from "../api/life-at-vyntics";
import { lifeErrorMessage } from "../lib/errors";
import type { LifeAtVyntics } from "../types";
import styles from "./life-at-vyntics.module.css";

export function LifeList() {
  const [items, setItems] = useState<LifeAtVyntics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [deleting, setDeleting] = useState<LifeAtVyntics>();
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const load = useCallback(async () => {
    setLoading(true); setError(undefined);
    try { setItems(await lifeAtVynticsApi.list()); }
    catch (caught) { setError(lifeErrorMessage(caught)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    lifeAtVynticsApi.list().then((value) => { if (active) setItems(value); }).catch((caught: unknown) => { if (active) setError(lifeErrorMessage(caught)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function confirmDelete() {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true); setDeleteError(undefined);
    try {
      await lifeAtVynticsApi.delete(deleting.id);
      setDeleting(undefined);
      setNotice("The image was permanently deleted.");
      // The backend closes the gap in display order; show what it stored.
      try { setItems(await lifeAtVynticsApi.list()); } catch (caught) { setError(lifeErrorMessage(caught)); }
    } catch (caught) { setDeleteError(lifeErrorMessage(caught, "delete this image")); }
    finally { setDeleteBusy(false); }
  }

  return <div className={styles.page}>
    <PageHeader title="Life at Vyntics" description="Manage the photos of company moments shown on the Vyntics website, in display order." actions={<Link className={styles.primaryLink} href="/life-at-vyntics/new">+ Add Image</Link>} />
    {notice ? <p className={styles.feedback} role="status">{notice}</p> : null}
    {loading ? <div aria-label="Loading Life at Vyntics" role="status"><div className={styles.skeletonGrid}><div className={styles.skeleton}/><div className={styles.skeleton}/><div className={styles.skeleton}/></div><p className={styles.muted}>Loading Life at Vyntics…</p></div> : null}
    {!loading && error ? <section className={styles.state} role="alert"><h2>Unable to load Life at Vyntics.</h2><p>{error}</p><Button onClick={() => void load()} variant="secondary">Try Again</Button></section> : null}
    {!loading && !error && items.length === 0 ? <section className={styles.state}><h2>No Life at Vyntics images yet.</h2><p>Add the first image to get started.</p><Link className={styles.primaryLink} href="/life-at-vyntics/new">Add Image</Link></section> : null}
    {!loading && !error && items.length ? <div className={styles.grid}>{items.map((item) => <article className={styles.card} key={item.id}>
      <Link aria-label={`Open image ${item.display_order} for editing`} className={styles.cardMain} href={`/life-at-vyntics/${encodeURIComponent(item.id)}/edit`}>
        <div className={styles.imageFrame}>{item.image_url ? <Image alt={`Life at Vyntics image ${item.display_order}`} className={styles.cardImage} fill sizes="(max-width: 42rem) calc(100vw - 3rem), (max-width: 72rem) 40vw, 24vw" src={item.image_url} unoptimized /> : <span>No image</span>}</div>
      </Link>
      <div className={styles.cardActions}><span className={styles.order}>Position {item.display_order}</span><div className={styles.actions}><Link className={styles.secondaryLink} href={`/life-at-vyntics/${encodeURIComponent(item.id)}/edit`}>Edit / Reorder<span className={styles.visuallyHidden}> image {item.display_order}</span></Link><Button aria-label={`Delete image ${item.display_order}`} onClick={() => { setNotice(undefined); setDeleting(item); }} variant="destructive">Delete</Button></div></div>
    </article>)}</div> : null}
    {deleting ? <DeleteConfirmationDialog busy={deleteBusy} description={`Image ${deleting.display_order} will be permanently deleted along with its stored file, and the images after it move up one position. This action cannot be undone.`} error={deleteError} itemName={`image ${deleting.display_order}`} onCancel={() => setDeleting(undefined)} onConfirm={() => void confirmDelete()} resourceLabel="Life at Vyntics image" /> : null}
  </div>;
}
