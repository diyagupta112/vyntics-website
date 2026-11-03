/** Backend response of PUT /blogs|case-studies/{id}/content-images. */
export type ContentImageUpload = { url: string; content_type: string; size_bytes: number };
export type ContentImageUploader = (file: File) => Promise<ContentImageUpload>;

export const MAX_CONTENT_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_ALT_LENGTH = 300;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

/** Friendly pre-upload check; the backend stays authoritative. */
export function validateContentImageFile(file: File): string | undefined {
  if (!file.size) return "Choose a non-empty image.";
  if (file.size > MAX_CONTENT_IMAGE_BYTES) return "The image must be 10 MB or smaller.";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!TYPES.has(file.type) || !extension || !EXTENSIONS.has(extension)) return "Choose a JPEG, PNG, or WebP image.";
}

export function validateAltText(value: string): string | undefined {
  const alt = value.trim();
  if (!alt) return "Alt text is required.";
  if (alt.length > MAX_ALT_LENGTH) return `Alt text must be ${MAX_ALT_LENGTH} characters or fewer.`;
}
