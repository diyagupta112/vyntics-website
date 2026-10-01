"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { CompactImagePreview } from "@/components/media/compact-image-preview";
import { Button } from "@/components/ui/button";
import { caseStudiesApi } from "../api/case-studies";
import { caseStudyErrorMessage } from "../lib/errors";
import type { CaseStudy } from "../types";
import styles from "./case-studies.module.css";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

function validate(file: File): string | undefined {
  if (file.size === 0) return "Choose a non-empty image.";
  if (file.size > MAX_IMAGE_BYTES) return "The image must be 5 MB or smaller.";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!TYPES.has(file.type) || !extension || !EXTENSIONS.has(extension)) {
    return "Choose a JPEG, PNG, or WebP image.";
  }
}

export function CoverImageControl({
  caseStudy,
  onBusyChange,
  onChanged,
}: {
  caseStudy: CaseStudy;
  onBusyChange?: (busy: boolean) => void;
  onChanged: (caseStudy: CaseStudy) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || busy) return;
    const problem = validate(file);
    if (problem) {
      setError(problem);
      event.target.value = "";
      return;
    }

    setBusy(true);
    onBusyChange?.(true);
    setError(undefined);
    setMessage(undefined);
    try {
      const updated = await caseStudiesApi.uploadCover(caseStudy.id, file);
      onChanged(updated);
      setMessage(
        caseStudy.cover_image_url
          ? "Cover image replaced."
          : "Cover image uploaded.",
      );
    } catch (caught) {
      setError(caseStudyErrorMessage(caught, "upload the cover image"));
    } finally {
      setBusy(false);
      onBusyChange?.(false);
      event.target.value = "";
    }
  }

  async function remove() {
    if (busy || caseStudy.status === "published") return;
    setBusy(true);
    onBusyChange?.(true);
    setError(undefined);
    setMessage(undefined);
    try {
      await caseStudiesApi.deleteCover(caseStudy.id);
      onChanged({ ...caseStudy, cover_image_url: null });
      setMessage("Cover image removed.");
    } catch (caught) {
      setError(caseStudyErrorMessage(caught, "remove the cover image"));
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  return (
    <section aria-labelledby="case-study-cover-heading" className={styles.section}>
      <div className={styles.sectionHeading}>
        <h2 id="case-study-cover-heading">Cover image</h2>
        <p>JPEG, PNG, or WebP. Maximum 5 MB.</p>
      </div>
      <div className={styles.cover}>
        <CompactImagePreview
          alt={`Cover for ${caseStudy.title}`}
          emptyText="No cover image uploaded"
          imageUrl={caseStudy.cover_image_url}
          label="Case Study cover image"
        />
        <input
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          aria-label="Choose Case Study cover image"
          className={styles.fileInput}
          disabled={busy}
          onChange={(event) => void upload(event)}
          ref={inputRef}
          type="file"
        />
        <div className={styles.actions}>
          <Button
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            variant="secondary"
          >
            {busy
              ? "Working…"
              : caseStudy.cover_image_url
                ? "Replace cover"
                : "Upload cover"}
          </Button>
          {caseStudy.cover_image_url ? (
            <Button
              disabled={busy || caseStudy.status === "published"}
              onClick={() => void remove()}
              variant="ghost"
            >
              Remove cover
            </Button>
          ) : null}
        </div>
        {caseStudy.status === "published" && caseStudy.cover_image_url ? (
          <p className={styles.muted}>
            Change this Case Study to draft or unpublished before removing its
            cover.
          </p>
        ) : null}
        {error ? (
          <div className={styles.feedback} role="alert">
            <strong>Cover was not changed</strong>
            <p>{error}</p>
          </div>
        ) : null}
        {message ? (
          <div className={styles.feedback} role="status">
            <p>{message}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
