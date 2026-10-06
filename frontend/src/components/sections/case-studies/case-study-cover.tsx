"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

export function CaseStudyCover({ src, title, className }: { src: string; title: string; className?: string }) {
  const [failedSource, setFailedSource] = useState<string>();
  if (!src || failedSource === src) return (
    <div className={className} role="img" aria-label={`${title} — preview unavailable`} style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "var(--color-surface)", color: "var(--color-muted)" }}>
      <span style={{ fontSize: ".8rem" }}>Project preview unavailable</span>
    </div>
  );
  return <img className={className} src={src} alt={`${title} project cover`} width="960" height="540" onError={() => setFailedSource(src)} />;
}
