import { getImageProps } from "next/image";

const storageHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname; } catch { return ""; }
})();

/** True for cover URLs on the configured storage host, the only remote host next.config.ts allows the image optimizer to fetch. */
export function isOptimizableCover(src: string) {
  try { return storageHost !== "" && new URL(src).hostname === storageHost; } catch { return false; }
}

/** src/srcSet/sizes for a plain <img> cover (width and height attributes stay with the caller). Storage covers are served resized and compressed; any other host keeps its original URL. */
export function coverImgProps(src: string, sizes: string, width = 960, height = 540) {
  if (!isOptimizableCover(src)) return { src };
  const { props } = getImageProps({ src, alt: "", width, height, sizes, quality: 90 });
  return { src: props.src, srcSet: props.srcSet, sizes: props.sizes };
}
