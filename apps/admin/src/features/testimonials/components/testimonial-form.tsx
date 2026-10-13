"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { contentErrorMessage, contentFieldErrors } from "@/components/content-management/errors";
import { isApiError } from "@/lib/api/errors";
import { testimonialsApi } from "../api/testimonials";
import { emptyTestimonialForm, testimonialToForm, testimonialCreateRequest, testimonialUpdateRequest, validateTestimonialForm, testimonialFieldMap, type TestimonialFormValues, type TestimonialFormErrors } from "../lib/testimonial-form";
import { CompanyLogoControl } from "./company-logo-control";
import type { Testimonial } from "../types";
import styles from "@/components/content-management/content-management.module.css";

export function TestimonialForm({ item, onCreated, onSaved }: { item?: Testimonial; onCreated?: (item: Testimonial) => void; onSaved?: (item: Testimonial) => void }) {
  const router = useRouter();
  const submitting = useRef(false);
  const [record, setRecord] = useState(item);
  const [selectedLogo, setSelectedLogo] = useState<File>();
  const [logoBusy, setLogoBusy] = useState(false);
  const [values, setValues] = useState<TestimonialFormValues>(() => item ? testimonialToForm(item) : emptyTestimonialForm);
  const [errors, setErrors] = useState<TestimonialFormErrors>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string>();
  const [message, setMessage] = useState<string>();
  function update(field: keyof TestimonialFormValues, value: string) {
    setValues(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
    setFailure(undefined); setMessage(undefined);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || logoBusy) return;
    const nextErrors = validateTestimonialForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    submitting.current = true; setBusy(true); setFailure(undefined); setMessage(undefined);
    try {
      let saved = record ? await testimonialsApi.update(record.id, testimonialUpdateRequest(values)) : await testimonialsApi.create(testimonialCreateRequest(values));
      const created = !record;
      setRecord(saved);
      if (created && selectedLogo) {
        try { saved = await testimonialsApi.uploadLogo(saved.id, selectedLogo); setRecord(saved); setSelectedLogo(undefined); }
        catch (caught) {
          setFailure(`Testimonial created, but the company logo upload failed. ${contentErrorMessage(caught, "testimonials", "upload the company logo")} Retry the logo upload below.`);
          return;
        }
      }
      setValues(testimonialToForm(saved));
      if (created) {
        if (onCreated) onCreated(saved);
        else router.push(`/testimonials/${encodeURIComponent(saved.id)}/edit?created=1`);
      } else { setMessage("Testimonial changes saved."); onSaved?.(saved); }
    } catch (caught) {
      if (isApiError(caught) && caught.kind === "validation") setErrors(contentFieldErrors(caught, testimonialFieldMap));
      setFailure(contentErrorMessage(caught, "testimonials", record ? "save this testimonial" : "create this testimonial"));
    } finally { submitting.current = false; setBusy(false); }
  }
  return <form className={styles.form} noValidate onSubmit={(event) => void submit(event)}>
    <section className={styles.section} aria-labelledby="testimonial-details-heading">
      <div className={styles.sectionHeading}><h2 id="testimonial-details-heading">Testimonial details</h2><p>Add the customer quote, attribution, and public visibility.</p></div>
      <div className={styles.fields}>
        <div className={styles.full}><FormField htmlFor="testimonial-quote" label="Quote" error={errors.quote} required><Textarea id="testimonial-quote" value={values.quote} aria-invalid={Boolean(errors.quote)} onChange={(event) => update("quote", event.target.value)} className={styles.longText} rows={6} /></FormField></div>
        <FormField htmlFor="testimonial-authorName" label="Author name" error={errors.authorName} required><Input id="testimonial-authorName" value={values.authorName} aria-invalid={Boolean(errors.authorName)} onChange={(event) => update("authorName", event.target.value)} /></FormField>
        <FormField htmlFor="testimonial-authorRole" label="Author role" error={errors.authorRole}><Input id="testimonial-authorRole" value={values.authorRole} aria-invalid={Boolean(errors.authorRole)} onChange={(event) => update("authorRole", event.target.value)} /></FormField>
        <FormField htmlFor="testimonial-companyName" label="Company name" error={errors.companyName}><Input id="testimonial-companyName" value={values.companyName} aria-invalid={Boolean(errors.companyName)} onChange={(event) => update("companyName", event.target.value)} /></FormField>

        <FormField htmlFor="testimonial-displayOrder" label="Display order" error={errors.displayOrder} required hint="Lower numbers appear first."><Input id="testimonial-displayOrder" value={values.displayOrder} aria-invalid={Boolean(errors.displayOrder)} onChange={(event) => update("displayOrder", event.target.value)} type="number" step="1" inputMode="numeric" /></FormField>
        <FormField htmlFor="testimonial-isActive" label="Active" error={errors.isActive} required hint="Inactive records remain here but are hidden from the website."><Select id="testimonial-isActive" value={values.isActive} aria-invalid={Boolean(errors.isActive)} onChange={(event) => update("isActive", event.target.value)}><option value="true">Active</option><option value="false">Inactive</option></Select></FormField>
      </div>
    </section>
    <CompanyLogoControl item={record} selectedFile={selectedLogo} onSelected={setSelectedLogo} disabled={busy} onBusyChange={setLogoBusy} onChanged={(updated) => { setRecord(updated); setFailure(undefined); onSaved?.(updated); }} />
    {failure ? <div className={styles.feedback} role="alert"><strong>Action could not be completed</strong><p>{failure}</p></div> : null}
    {message ? <div className={styles.feedback} role="status"><strong>Saved</strong><p>{message}</p></div> : null}
    <div className={styles.actions}><Button disabled={busy || logoBusy} type="submit">{busy ? "Saving…" : record ? "Save Changes" : "Create Testimonial"}</Button><Link className={styles.secondaryLink} href="/testimonials">Cancel</Link></div>
  </form>;
}
