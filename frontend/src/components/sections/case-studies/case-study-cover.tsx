"use client";
/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { useState } from "react";

export function CaseStudyCover({ src, title, className, optimized = false }: { src: string; title: string; className?: string; optimized?: boolean }) {
  const [failedSource, setFailedSource] = useState<string>();
  if (!src || failedSource === src) return (
    <div className={className} role="img" aria-label={`${title} — preview unavailable`} style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "var(--color-surface)", color: "var(--color-muted)" }}>
      <span style={{ fontSize: ".8rem" }}>Project preview unavailable</span>
    </div>
  );
  if (optimized) return <Image unoptimized className={className} src={src} alt={`${title} project cover`} width={960} height={540} onError={() => setFailedSource(src)} />;
  return <img className={className} src={src} alt={`${title} project cover`} width="960" height="540" onError={() => setFailedSource(src)} />;
}
