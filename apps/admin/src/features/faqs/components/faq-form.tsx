"use client";

import Link from "next/link";
import { displayOrderHint } from "@/lib/forms/display-order";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { contentErrorMessage, contentFieldErrors } from "@/components/content-management/errors";
import { isApiError } from "@/lib/api/errors";
import { faqsApi } from "../api/faqs";
import { emptyFAQForm, faqToForm, faqCreateRequest, faqUpdateRequest, validateFAQForm, faqFieldMap, type FAQFormValues, type FAQFormErrors } from "../lib/faq-form";
import type { FAQ } from "../types";
import { faqPageChoices, faqSubPageChoices } from "../lib/page-options";
import styles from "@/components/content-management/content-management.module.css";

export function FAQForm({ item, onCreated, onSaved }: { item?: FAQ; onCreated?: (item: FAQ) => void; onSaved?: (item: FAQ) => void }) {
  const router = useRouter();
  const submitting = useRef(false);
  const [values, setValues] = useState<FAQFormValues>(() => item ? faqToForm(item) : emptyFAQForm);
  const [errors, setErrors] = useState<FAQFormErrors>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string>();
  const [message, setMessage] = useState<string>();
  function update(field: keyof FAQFormValues, value: string) {
    // A sub-page belongs to one page, so changing the page clears it rather than sending a mismatch.
    setValues(current => ({ ...current, [field]: value, ...(field === "page" && value !== current.page ? { subPage: "" } : {}) }));
    setErrors(current => ({ ...current, [field]: undefined, ...(field === "page" ? { subPage: undefined } : {}) }));
    setFailure(undefined); setMessage(undefined);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const nextErrors = validateFAQForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    submitting.current = true; setBusy(true); setFailure(undefined); setMessage(undefined);
    try {
      const saved = item ? await faqsApi.update(item.id, faqUpdateRequest(values)) : await faqsApi.create(faqCreateRequest(values));
      setValues(faqToForm(saved));
      if (!item) {
        if (onCreated) onCreated(saved);
        else router.push(`/faqs/${encodeURIComponent(saved.id)}/edit?created=1`);
      } else { setMessage("FAQ changes saved."); onSaved?.(saved); }
    } catch (caught) {
      if (isApiError(caught) && caught.kind === "validation") setErrors(contentFieldErrors(caught, faqFieldMap));
      setFailure(contentErrorMessage(caught, "faqs", item ? "save this faq" : "create this faq"));
    } finally { submitting.current = false; setBusy(false); }
  }
  const subPages = faqSubPageChoices(values.page, values.subPage);
  return <form className={styles.form} noValidate onSubmit={(event) => void submit(event)}>
    <section className={styles.section} aria-labelledby="faq-details-heading">
      <div className={styles.sectionHeading}><h2 id="faq-details-heading">FAQ details</h2><p>Choose the page, then add its question and answer.</p></div>
      <div className={styles.fields}>
        <FormField htmlFor="faq-page" label="Page" error={errors.page} required><Select id="faq-page" value={values.page} aria-invalid={Boolean(errors.page)} onChange={(event) => update("page", event.target.value)}><option value="">Select a page</option>{faqPageChoices([values.page]).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></FormField>
        <FormField htmlFor="faq-sub-page" label="Sub-page" error={errors.subPage} hint={subPages.length ? "Optional. Leave as None for an FAQ on the main page." : "This page has no sub-pages. The FAQ belongs to the main page."}><Select id="faq-sub-page" value={values.subPage} aria-invalid={Boolean(errors.subPage)} disabled={!values.page || !subPages.length} onChange={(event) => update("subPage", event.target.value)}><option value="">None (main page)</option>{subPages.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></FormField>
        <div className={styles.full}><FormField htmlFor="faq-question" label="Question" error={errors.question} required><Input id="faq-question" value={values.question} aria-invalid={Boolean(errors.question)} onChange={(event) => update("question", event.target.value)} /></FormField></div>
        <div className={styles.full}><FormField htmlFor="faq-answer" label="Answer" error={errors.answer} required><Textarea id="faq-answer" value={values.answer} aria-invalid={Boolean(errors.answer)} onChange={(event) => update("answer", event.target.value)} className={styles.longText} rows={6} /></FormField></div>
        <FormField htmlFor="faq-displayOrder" label="Display order" error={errors.displayOrder} hint={displayOrderHint}><Input min="1" id="faq-displayOrder" value={values.displayOrder} aria-invalid={Boolean(errors.displayOrder)} onChange={(event) => update("displayOrder", event.target.value)} type="number" step="1" inputMode="numeric" /></FormField>
        <FormField htmlFor="faq-isActive" label="Active" error={errors.isActive} required hint="Inactive records remain here but are hidden from the website."><Select id="faq-isActive" value={values.isActive} aria-invalid={Boolean(errors.isActive)} onChange={(event) => update("isActive", event.target.value)}><option value="true">Active</option><option value="false">Inactive</option></Select></FormField>
      </div>
    </section>
    {failure ? <div className={styles.feedback} role="alert"><strong>Changes were not saved</strong><p>{failure}</p></div> : null}
    {message ? <div className={styles.feedback} role="status"><strong>Saved</strong><p>{message}</p></div> : null}
    <div className={styles.actions}><Button disabled={busy} type="submit">{busy ? "Saving…" : item ? "Save Changes" : "Create FAQ"}</Button><Link className={styles.secondaryLink} href="/faqs">Cancel</Link></div>
  </form>;
}
