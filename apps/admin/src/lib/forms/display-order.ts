/**
 * Display Order is an optional desired 1-based position. The backend owns all ordering:
 * a blank value is omitted so it appends, and a position is sent as typed so it inserts.
 */
export const displayOrderHint = "Leave blank to add this item to the end.";

/** Error message when non-blank text is not a positive whole number. */
export function validateDisplayOrder(value: string): string | undefined {
  const text = value.trim();
  if (!text) return undefined;
  if (!/^\d+$/.test(text) || Number(text) < 1) return "Display order must be a whole number of 1 or more.";
}

/** Payload fragment: nothing for a blank value, otherwise the exact integer. */
export function displayOrderPayload(value: string): { display_order?: number } {
  const text = value.trim();
  return text ? { display_order: Number(text) } : {};
}
