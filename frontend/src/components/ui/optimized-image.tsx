/* eslint-disable @next/next/no-img-element */
import Image from "next/image";

// Backend images live in public Supabase storage. Only that host is allowed by `images.remotePatterns` in next.config.ts,
// so only those URLs (and the site's own /images files) go through the Next.js image optimizer.
const storageHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname; } catch { return ""; }
})();

export function canOptimize(src: string) {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && Boolean(storageHost) && url.hostname === storageHost && url.pathname.startsWith("/storage/v1/object/public/");
  } catch {
    return false;
  }
}

/** Address of a small optimized copy, for reading an image's proportions without downloading the original. */
export function thumbnailUrl(src: string, width = 256) {
  return canOptimize(src) ? `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75` : src;
}

type OptimizedImageProps = {
  src: string;
  alt: string;
  /** Rendered width at each breakpoint, so the browser downloads the smallest sufficient file. */
  sizes: string;
  className?: string;
  priority?: boolean;
  /** With both width and height the image takes its own space; without them it fills its (positioned) parent. */
  width?: number;
  height?: number;
  onError?: () => void;
};

/** Optimized, resized, WebP-converted images for backend photos. Hosts that cannot be optimized fall back to a plain <img>. */
export function OptimizedImage({ src, alt, sizes, className, priority = false, width, height, onError }: OptimizedImageProps) {
  if (!canOptimize(src)) {
    return <img className={className} src={src} alt={alt} width={width} height={height} sizes={sizes} loading={priority ? "eager" : "lazy"} decoding="async" onError={onError} />;
  }
  const dimensions = width && height ? { width, height } : { fill: true as const };
  return <Image className={className} src={src} alt={alt} sizes={sizes} priority={priority} onError={onError} {...dimensions} />;
}
