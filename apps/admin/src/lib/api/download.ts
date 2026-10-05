import type { ApiDownload } from "./client";

function downloadFilename(disposition: string | null, fallback: string): string {
  const encoded = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plain = disposition?.match(/filename=(?:"([^"]+)"|([^;]+))/i);
  let filename = plain?.[1] ?? plain?.[2]?.trim() ?? fallback;
  if (encoded) {
    try { filename = decodeURIComponent(encoded); } catch { /* Use the plain filename or fallback. */ }
  }
  return filename.replace(/[\\/\x00-\x1f]/g, "_");
}

export function downloadFile(file: ApiDownload, fallback: string): void {
  const url = URL.createObjectURL(file.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = downloadFilename(file.disposition, fallback);
  document.body.append(anchor);
  try { anchor.click(); } finally {
    anchor.remove();
    // Allow the browser to start reading the blob before releasing it.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
