"use client";

import { useState } from "react";

/** Badge artwork on a white tile; falls back to the title's first letter if the image fails. */
export function FooterBadgeImage({ src, alt, title, className, letterClassName }: { src: string | null; alt: string; title: string; className: string; letterClassName: string }) {
  const [failedSource, setFailedSource] = useState<string>();
  if (!src || failedSource === src) return <span className={letterClassName} aria-hidden="true">{title.trim().charAt(0).toUpperCase()}</span>;
  // Public badge URLs are already resolved by backend storage; use them unchanged, as the recognitions page does.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} width={320} height={160} className={className} onError={() => setFailedSource(src)} />;
}
