// Shared cache settings for anonymous public GET requests to the API.
// None of these requests send cookies or credentials, so a shared cache cannot leak user-specific data.
export const PUBLIC_REVALIDATE_SECONDS = 300;

export const PUBLIC_CACHE_TAGS = ["badges", "blogs", "testimonials", "faqs", "team", "careers", "case-studies"] as const;
export type PublicCacheTag = (typeof PUBLIC_CACHE_TAGS)[number];

// Spread into a fetch() init. Only 200 responses are stored, so errors are retried on the next request.
export function publicFetch(tag: PublicCacheTag) {
  return { next: { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [tag] } };
}
