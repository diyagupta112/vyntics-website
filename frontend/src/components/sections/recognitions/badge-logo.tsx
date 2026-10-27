"use client";

import { useState } from "react";
import { OptimizedImage } from "@/components/ui/optimized-image";

export function BadgeLogo({ src, name, className }: { src: string | null; name: string; className?: string }) {
  const [failedSource, setFailedSource] = useState<string>();
  if (!src || failedSource === src) return <span className={className}>{name}</span>;
  // Public badge URLs are already resolved by backend storage; use them unchanged.
  return <OptimizedImage src={src} alt={`${name} recognition badge`} width={320} height={160} sizes="320px" className={className} onError={() => setFailedSource(src)} />;
}
