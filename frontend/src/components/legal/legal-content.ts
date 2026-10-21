export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: readonly string[] };

export type LegalSection = { title: string; blocks: readonly LegalBlock[] };

/** Stable, readable id for a heading, for example "1. Who We Are" becomes "1-who-we-are". */
export const slugify = (text: string) => text.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
