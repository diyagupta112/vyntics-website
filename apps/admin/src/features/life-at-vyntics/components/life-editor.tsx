"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
import { FormField } from "@/components/forms/form-field";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isApiError } from "@/lib/api/errors";
import { lifeAtVynticsApi } from "../api/life-at-vyntics";
import { lifeErrorMessage } from "../lib/errors";
import { orderIssue, validateOrder } from "../lib/order";
import type { LifeAtVyntics } from "../types";
import { ImageControl } from "./image-control";
import styles from "./life-at-vyntics.module.css";

export function LifeEditor({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [item, setItem] = useState<LifeAtVyntics>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [order, setOrder] = useState("");
  const [orderError, setOrderError] = useState<string>();
  const [orderFailure, setOrderFailure] = useState<string>();
  const [orderMessage, setOrderMessage] = useState<string>();
  const [orderBusy, setOrderBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const show = useCallback((value: LifeAtVyntics) => { setItem(value); setOrder(String(value.display_order)); }, []);
  const load = useCallback(async () => { setLoading(true); setError(undefined); try { show(await lifeAtVynticsApi.get(itemId)); } catch (caught) { setError(lifeErrorMessage(caught, "load this image")); } finally { setLoading(false); } }, [itemId, show]);
  useEffect(() => { let active = true; lifeAtVynticsApi.get(itemId).then((value) => { if (active) show(value); }).catch((caught: unknown) => { if (active) setError(lifeErrorMessage(caught, "load this image")); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [itemId, show]);

  async function saveOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item || orderBusy) return;
    const problem = validateOrder(order);
    setOrderError(problem); setOrderFailure(undefined); setOrderMessage(undefined);
    if (problem || Number(order) === item.display_order) return;
    setOrderBusy(true);
    try {
      await lifeAtVynticsApi.update(item.id, { display_order: Number(order) });
      // The backend shifts the neighbors (and may clamp); show the stored position.
      show(await lifeAtVynticsApi.get(item.id));
      setOrderMessage("Display order saved.");
    } catch (caught) {
      if (isApiError(caught) && caught.kind === "validation") setOrderError(orderIssue(caught));
      setOrderFailure(lifeErrorMessage(caught, "save the display order"));
    } finally { setOrderBusy(false); }
  }
  async function remove() {
    if (!item || deleteBusy) return;
    setDeleteBusy(true); setDeleteError(undefined);
    try { await lifeAtVynticsApi.delete(item.id); router.push("/life-at-vyntics?deleted=1"); }
    catch (caught) { setDeleteError(lifeErrorMessage(caught, "delete this image")); }
    finally { setDeleteBusy(false); }
  }
  if (loading) return <div aria-label="Loading Life at Vyntics image" className={styles.page} role="status"><div className={styles.skeleton}/><p>Loading image…</p></div>;
  if (error || !item) return <section className={styles.state} role="alert"><h1>Image unavailable</h1><p>{error ?? "This image could not be loaded."}</p><div className={styles.actions}><Button onClick={() => void load()} variant="secondary">Try Again</Button><Link className={styles.secondaryLink} href="/life-at-vyntics">Back to Life at Vyntics</Link></div></section>;
  return <div className={styles.page}>
    <PageHeader title={`Image ${item.display_order}`} description="Replace or remove the image, or move it to a different position." actions={<><Link className={styles.secondaryLink} href="/life-at-vyntics">Back to Life at Vyntics</Link><Button onClick={() => setConfirming(true)} variant="destructive">Delete Permanently</Button></>} />
    <div className={styles.detailLayout}>
      <form className={styles.form} noValidate onSubmit={(event) => void saveOrder(event)}>
        <section aria-labelledby="life-order-heading" className={styles.section}>
          <div className={styles.sectionHeading}><h2 id="life-order-heading">Display order</h2><p>Other images move up or down automatically.</p></div>
          <FormField error={orderError} htmlFor="lifeDisplayOrder" label="Position" required><Input aria-invalid={Boolean(orderError)} id="lifeDisplayOrder" min="1" onChange={(event) => { setOrder(event.target.value); setOrderError(undefined); setOrderMessage(undefined); }} step="1" type="number" value={order} /></FormField>
          {orderFailure ? <div className={styles.feedback} role="alert"><strong>Order was not saved</strong><p>{orderFailure}</p></div> : null}
          {orderMessage ? <div className={styles.feedback} role="status"><strong>Saved</strong><p>{orderMessage}</p></div> : null}
          <div className={styles.formActions}><Button disabled={orderBusy} type="submit">{orderBusy ? "Saving…" : "Save Order"}</Button></div>
        </section>
      </form>
      <aside className={styles.imagePanel}><ImageControl item={item} onChanged={show} /></aside>
    </div>
    {confirming ? <DeleteConfirmationDialog busy={deleteBusy} description="This image record and its stored file will be permanently deleted, and the images after it move up one position. This action cannot be undone." error={deleteError} itemName={`image ${item.display_order}`} onCancel={() => setConfirming(false)} onConfirm={() => void remove()} resourceLabel="Life at Vyntics image" /> : null}
  </div>;
}
