"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isApiError } from "@/lib/api/errors";
import { lifeAtVynticsApi } from "../api/life-at-vyntics";
import { lifeErrorMessage } from "../lib/errors";
import { orderIssue, validateOrder } from "../lib/order";
import type { LifeAtVyntics } from "../types";
import { validateLifeImage } from "./image-control";
import styles from "./life-at-vyntics.module.css";

/** Creates the record, then uploads its image; the backend owns all reordering. */
export function LifeCreate() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [order, setOrder] = useState("");
  const [created, setCreated] = useState<LifeAtVyntics>();
  const [imageError, setImageError] = useState<string>();
  const [orderError, setOrderError] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    // Only a starting suggestion; if the list cannot load, a blank order appends.
    lifeAtVynticsApi.list().then((items) => { if (active) setOrder((current) => current || String(items.length + 1)); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  function choose(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0];
    setFailure(undefined);
    if (!next) { setFile(undefined); return; }
    const problem = validateLifeImage(next);
    setImageError(problem);
    setFile(problem ? undefined : next);
    if (problem) event.target.value = "";
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const nextOrderError = created ? undefined : validateOrder(order, true);
    const nextImageError = file ? undefined : imageError ?? "Choose an image to upload.";
    setOrderError(nextOrderError); setImageError(nextImageError);
    if (nextOrderError || nextImageError || !file) return;
    setBusy(true); setFailure(undefined);
    let record = created;
    try {
      if (!record) {
        record = await lifeAtVynticsApi.create(order.trim() ? { display_order: Number(order) } : {});
        setCreated(record);
      }
      await lifeAtVynticsApi.uploadImage(record.id, file);
      router.push("/life-at-vyntics");
    } catch (caught) {
      if (!record && isApiError(caught) && caught.kind === "validation") setOrderError(orderIssue(caught));
      setFailure(record
        ? `The entry was created at position ${record.display_order}, but the image could not be uploaded. ${lifeErrorMessage(caught, "upload the image")} Choose Upload Image to retry, or open the entry later.`
        : lifeErrorMessage(caught, "add this image"));
    } finally { setBusy(false); }
  }

  return <form className={styles.form} noValidate onSubmit={(event) => void submit(event)}>
    <section aria-labelledby="life-add-heading" className={styles.section}>
      <div className={styles.sectionHeading}><h2 id="life-add-heading">New image</h2><p>JPEG, PNG, or WebP. Maximum 5 MB.</p></div>
      <div className={styles.fields}>
        <div className={styles.full}><FormField error={imageError} htmlFor="lifeImage" label="Image" required><input accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" aria-invalid={Boolean(imageError)} className={styles.fileInput} disabled={busy} id="lifeImage" onChange={choose} ref={input} type="file" /></FormField></div>
        <FormField error={orderError} hint="Existing images from this position move down. Leave blank to add at the end." htmlFor="lifeDisplayOrder" label="Display order"><Input aria-invalid={Boolean(orderError)} disabled={busy || Boolean(created)} id="lifeDisplayOrder" min="1" onChange={(event) => { setOrder(event.target.value); setOrderError(undefined); }} step="1" type="number" value={order} /></FormField>
      </div>
    </section>
    {failure ? <div className={styles.feedback} role="alert"><strong>{created ? "Image not uploaded" : "Image not added"}</strong><p>{failure}</p></div> : null}
    <div className={styles.formActions}><Button disabled={busy} type="submit">{busy ? "Saving…" : created ? "Upload Image" : "Add Image"}</Button><Link className={styles.secondaryLink} href="/life-at-vyntics">Cancel</Link></div>
  </form>;
}
