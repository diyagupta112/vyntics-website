"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { CreateFlowActions } from "@/components/create-flow/two-step-create-flow";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/errors";
import { badgesApi } from "../api/badges";
import { backendFieldErrors, badgeToForm, emptyBadgeForm, toCreateRequest, toUpdateRequest, validateBadgeForm, type BadgeFormErrors, type BadgeFormValues } from "../lib/badge-form";
import { badgeErrorMessage } from "../lib/errors";
import type { Badge } from "../types";
import styles from "./badges.module.css";

type Props = { badge?: Badge; createFlow?: boolean; onCreated?: (badge: Badge) => void; onSaved?: (badge: Badge) => void };

export function BadgeForm({ badge, createFlow = false, onCreated, onSaved }: Props) {
  const isCreate = !badge;
  const [values, setValues] = useState<BadgeFormValues>(() => badge ? badgeToForm(badge) : emptyBadgeForm);
  const [errors, setErrors] = useState<BadgeFormErrors>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string>();
  const [message, setMessage] = useState<string>();

  function update(field: keyof BadgeFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFailure(undefined);
    setMessage(undefined);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const nextErrors = validateBadgeForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setBusy(true);
    setFailure(undefined);
    setMessage(undefined);
    try {
      const saved = badge
        ? await badgesApi.update(badge.id, toUpdateRequest(values))
        : await badgesApi.create(toCreateRequest(values));
      setValues(badgeToForm(saved));
      if (isCreate) onCreated?.(saved);
      else {
        setMessage("Badge changes saved.");
        onSaved?.(saved);
      }
    } catch (caught) {
      if (isApiError(caught) && caught.kind === "validation") setErrors(backendFieldErrors(caught));
      setFailure(badgeErrorMessage(caught, isCreate ? "create this Badge" : "save this Badge"));
    } finally { setBusy(false); }
  }

  return <form className={styles.form} noValidate onSubmit={(event) => void submit(event)}>
    <section aria-labelledby="badge-information-heading" className={styles.section}>
      <div className={styles.sectionHeading}><h2 id="badge-information-heading">Badge details</h2><p>Manage the public label, link, order, and visibility.</p></div>
      <div className={styles.fields}>
        <FormField error={errors.name} htmlFor="badgeName" label="Name" required><Input aria-invalid={Boolean(errors.name)} id="badgeName" maxLength={200} onChange={(event) => update("name", event.target.value)} value={values.name} /></FormField>
        <FormField error={errors.displayOrder} hint="Lower numbers appear first." htmlFor="badgeDisplayOrder" label="Display order" required><Input aria-invalid={Boolean(errors.displayOrder)} id="badgeDisplayOrder" onChange={(event) => update("displayOrder", event.target.value)} step="1" type="number" value={values.displayOrder} /></FormField>
        <FormField error={errors.websiteUrl} htmlFor="badgeWebsiteUrl" label="Website URL"><Input aria-invalid={Boolean(errors.websiteUrl)} id="badgeWebsiteUrl" maxLength={2048} onChange={(event) => update("websiteUrl", event.target.value)} placeholder="https://example.com" type="url" value={values.websiteUrl} /></FormField>
        <FormField error={errors.isActive} htmlFor="badgeActive" label="Active" required><Select aria-invalid={Boolean(errors.isActive)} id="badgeActive" onChange={(event) => update("isActive", event.target.value)} value={values.isActive}><option value="true">Active</option><option value="false">Inactive</option></Select></FormField>
        <div className={styles.full}><FormField error={errors.description} hint="Optional. Keep it short for the badge card." htmlFor="badgeDescription" label="Description"><Textarea aria-invalid={Boolean(errors.description)} id="badgeDescription" maxLength={1000} onChange={(event) => update("description", event.target.value)} value={values.description} /></FormField></div>
      </div>
    </section>
    {failure ? <div className={styles.feedback} role="alert"><strong>Changes were not saved</strong><p>{failure}</p></div> : null}
    {message ? <div className={styles.feedback} role="status"><strong>Saved</strong><p>{message}</p></div> : null}
    {createFlow ? <CreateFlowActions backHref="/badges" backLabel="Cancel" busy={busy} busyLabel={isCreate ? "Creating…" : "Saving…"} primaryLabel="Next →" primaryType="submit" /> : <div className={styles.formActions}><Button disabled={busy} type="submit">{busy ? "Saving…" : "Save Changes"}</Button><Link className={styles.secondaryLink} href="/badges">Cancel</Link></div>}
  </form>;
}
