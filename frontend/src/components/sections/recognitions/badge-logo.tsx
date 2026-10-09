"use client";

import { useState } from "react";

export function BadgeLogo({ src, name, className }: { src: string | null; name: string; className?: string }) {
  const [failedSource, setFailedSource] = useState<string>();
  if (!src || failedSource === src) return <span className={className}>{name}</span>;
  // Public badge URLs are already resolved by backend storage; use them unchanged.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`${name} recognition badge`} width={320} height={160} className={className} onError={() => setFailedSource(src)} />;
}
