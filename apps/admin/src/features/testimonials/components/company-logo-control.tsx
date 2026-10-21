"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { CompactImagePreview } from "@/components/media/compact-image-preview";
import { Button } from "@/components/ui/button";
import { contentErrorMessage } from "@/components/content-management/errors";
import { testimonialsApi } from "../api/testimonials";
import type { Testimonial } from "../types";
import styles from "@/components/content-management/content-management.module.css";
import logoStyles from "./company-logo-control.module.css";

export function validateCompanyLogo(file: File): string | undefined {
  if (!file.size) return "Choose a non-empty image.";
  if (file.size > 5 * 1024 * 1024) return "The logo must be 5 MiB or smaller.";
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || !/\.(jpe?g|png|webp)$/i.test(file.name)) return "Choose a JPEG, PNG, or WebP image.";
}

type Props = {
  item?: Testimonial;
  selectedFile?: File;
  onSelected: (file?: File) => void;
  onChanged: (item: Testimonial) => void;
  onBusyChange: (busy: boolean) => void;
  disabled?: boolean;
};

export function CompanyLogoControl({ item, selectedFile, onSelected, onChanged, onBusyChange, disabled = false }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const locked = useRef(false);
  const [operation, setOperation] = useState<"upload" | "remove">();
  const [preview, setPreview] = useState<string>();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const previewUrl = useRef<string | undefined>(undefined);
  useEffect(() => () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); }, []);
  function clearPreview() {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = undefined;
    setPreview(undefined);
  }

  async function upload(file: File) {
    if (!item || locked.current || disabled) return;
    locked.current = true; setOperation("upload"); onBusyChange(true); setError(undefined); setMessage(undefined);
    try {
      onChanged(await testimonialsApi.uploadLogo(item.id, file));
      onSelected(undefined); clearPreview();
      setMessage(item.company_logo_url ? "Company logo replaced." : "Company logo uploaded.");
    } catch (caught) { setError(contentErrorMessage(caught, "testimonials", "upload the company logo")); }
    finally { locked.current = false; setOperation(undefined); onBusyChange(false); }
  }
  function select(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file || locked.current || disabled) return;
    const problem = validateCompanyLogo(file);
    if (problem) { setError(problem); return; }
    setError(undefined); setMessage(undefined);
    clearPreview();
    if (!item) { const url = URL.createObjectURL(file); previewUrl.current = url; setPreview(url); }
    onSelected(file);
    if (item) void upload(file);
  }
  async function remove() {
    if (!item || locked.current || disabled) return;
    locked.current = true; setOperation("remove"); onBusyChange(true); setError(undefined); setMessage(undefined);
    try {
      await testimonialsApi.deleteLogo(item.id);
      onChanged({ ...item, company_logo_url: null }); onSelected(undefined); clearPreview();
      setMessage("Company logo removed.");
    } catch (caught) { setError(contentErrorMessage(caught, "testimonials", "remove the company logo")); }
    finally { locked.current = false; setOperation(undefined); onBusyChange(false); }
  }
  const busy = disabled || !!operation;
  return <section className={styles.section} aria-labelledby="testimonial-logo-heading">
    <div className={styles.sectionHeading}><h2 id="testimonial-logo-heading">Company Logo</h2><p>JPEG, PNG, or WebP. Maximum 5 MiB.{!item ? " The selected logo uploads after the testimonial is created." : ""}</p></div>
    <div className={logoStyles.control}>
      <CompactImagePreview alt="Testimonial company logo" emptyText="No company logo uploaded" imageUrl={item ? item.company_logo_url : selectedFile ? preview ?? null : null} label="Company logo" />
      <input ref={input} className={logoStyles.fileInput} aria-label="Choose company logo" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" disabled={busy} onChange={select} />
      {selectedFile ? <p>{selectedFile.name} - {operation ? "uploading" : "not uploaded yet"}</p> : null}
      <div className={styles.actions}>
        <Button disabled={busy} onClick={() => input.current?.click()} variant="secondary">{operation === "upload" ? "Uploading…" : selectedFile || item?.company_logo_url ? "Replace Logo" : "Upload Logo"}</Button>
        {item && selectedFile ? <Button disabled={busy} onClick={() => void upload(selectedFile)} variant="secondary">Retry Logo Upload</Button> : null}
        {item?.company_logo_url ? <Button disabled={busy} onClick={() => void remove()} variant="ghost">{operation === "remove" ? "Removing…" : "Remove Logo"}</Button> : null}
        {selectedFile && !item ? <Button disabled={busy} onClick={() => { onSelected(undefined); clearPreview(); }} variant="ghost">Clear Selected Logo</Button> : null}
      </div>
      {error ? <p className={styles.feedback} role="alert">{error}</p> : null}
      {message ? <p className={styles.feedback} role="status">{message}</p> : null}
    </div>
  </section>;
}
