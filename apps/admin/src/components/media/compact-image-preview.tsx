"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./compact-image-preview.module.css";

type CompactImagePreviewProps = {
  alt: string;
  emptyText: string;
  imageUrl: string | null;
  label: string;
};

export function CompactImagePreview({
  alt,
  emptyText,
  imageUrl,
  label,
}: CompactImagePreviewProps) {
  const [open, setOpen] = useState(false);
  const dialogId = useId();
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) triggerRef.current?.focus();
      wasOpenRef.current = false;
      return;
    }

    wasOpenRef.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!imageUrl) {
    return (
      <div className={styles.root}>
        <div className={styles.emptyFrame}>{emptyText}</div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <button
        aria-controls={dialogId}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`View ${label}`}
        className={styles.previewButton}
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <Image
          alt={alt}
          className={styles.previewImage}
          height={540}
          sizes="(max-width: 68rem) calc(100vw - 4rem), 24rem"
          src={imageUrl}
          unoptimized
          width={960}
        />
        <span aria-hidden="true" className={styles.expandLabel}>
          <svg fill="none" height="16" viewBox="0 0 24 24" width="16">
            <path d="m15 3h6v6m0-6-7 7M9 21H3v-6m0 6 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
          </svg>
          View image
        </span>
      </button>

      {open
        ? createPortal(
            <div
              className={styles.backdrop}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setOpen(false);
              }}
            >
              <section
                aria-labelledby={titleId}
                aria-modal="true"
                className={styles.viewer}
                id={dialogId}
                role="dialog"
              >
                <header className={styles.viewerHeader}>
                  <h2 id={titleId}>{label}</h2>
                  <button
                    aria-label="Close image viewer"
                    className={styles.closeButton}
                    onClick={() => setOpen(false)}
                    ref={closeRef}
                    type="button"
                  >
                    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
                      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
                    </svg>
                  </button>
                </header>
                <div className={styles.expandedFrame}>
                  <Image
                    alt={alt}
                    className={styles.expandedImage}
                    fill
                    sizes="calc(100vw - 4rem)"
                    src={imageUrl}
                    unoptimized
                  />
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
