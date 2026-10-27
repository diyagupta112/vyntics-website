"use client";
import { useState } from "react";
import { OptimizedImage } from "@/components/ui/optimized-image";

export function CaseStudyCover({ src, title, className, sizes = "(max-width: 900px) 100vw, 50vw" }: { src: string; title: string; className?: string; optimized?: boolean; sizes?: string }) {
  const [failedSource, setFailedSource] = useState<string>();
  if (!src || failedSource === src) return (
    <div className={className} role="img" aria-label={`${title} - preview unavailable`} style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "var(--color-surface)", color: "var(--color-muted)" }}>
      <span style={{ fontSize: ".8rem" }}>Project preview unavailable</span>
    </div>
  );
  return <OptimizedImage className={className} src={src} alt={`${title} project cover`} width={960} height={540} sizes={sizes} onError={() => setFailedSource(src)} />;
}
