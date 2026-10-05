"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { CompactImagePreview } from "@/components/media/compact-image-preview";
import { Button } from "@/components/ui/button";
import { badgesApi } from "../api/badges";
import { badgeErrorMessage } from "../lib/errors";
import type { Badge } from "../types";
import styles from "./badges.module.css";

const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const LOGO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const LOGO_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

export function validateBadgeLogo(file: File) {
  if (!file.size) return "Choose a non-empty image.";
  if (file.size > MAX_LOGO_SIZE) return "The logo must be 5 MB or smaller.";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!LOGO_TYPES.has(file.type) || !extension || !LOGO_EXTENSIONS.has(extension)) return "Choose a JPEG, PNG, or WebP image.";
}

export function LogoControl({ badge, onBusyChange, onChanged }: { badge: Badge; onBusyChange?: (busy: boolean) => void; onChanged: (badge: Badge) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || busy) return;
    const problem = validateBadgeLogo(file);
    if (problem) { setError(problem); event.target.value = ""; return; }
    setBusy(true); onBusyChange?.(true); setError(undefined); setMessage(undefined);
    try {
      const updated = await badgesApi.uploadLogo(badge.id, file);
      onChanged(updated);
      setMessage(badge.logo_url ? "Logo replaced." : "Logo uploaded.");
    } catch (caught) { setError(badgeErrorMessage(caught, "upload the logo")); }
    finally { setBusy(false); onBusyChange?.(false); event.target.value = ""; }
  }

  async function remove() {
    if (busy) return;
    setBusy(true); onBusyChange?.(true); setError(undefined); setMessage(undefined);
    try {
      await badgesApi.deleteLogo(badge.id);
      onChanged({ ...badge, logo_url: null });
      setMessage("Logo removed.");
    } catch (caught) { setError(badgeErrorMessage(caught, "remove the logo")); }
    finally { setBusy(false); onBusyChange?.(false); }
  }

  return <section aria-labelledby="badge-logo-heading" className={styles.section}>
    <div className={styles.sectionHeading}><h2 id="badge-logo-heading">Badge logo</h2><p>JPEG, PNG, or WebP. Maximum 5 MB.</p></div>
    <div className={styles.logoControl}>
      <CompactImagePreview alt={`${badge.name} logo`} emptyText="No logo uploaded" imageUrl={badge.logo_url} label="Badge logo" />
      <input accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" aria-label="Choose Badge logo" className={styles.fileInput} disabled={busy} onChange={(event) => void upload(event)} ref={input} type="file" />
      <div className={styles.actions}><Button disabled={busy} onClick={() => input.current?.click()} variant="secondary">{busy ? "Working…" : badge.logo_url ? "Replace Logo" : "Upload Logo"}</Button>{badge.logo_url ? <Button disabled={busy} onClick={() => void remove()} variant="ghost">Remove Logo</Button> : null}</div>
      {error ? <p className={styles.feedback} role="alert">{error}</p> : null}
      {message ? <p className={styles.feedback} role="status">{message}</p> : null}
    </div>
  </section>;
}
