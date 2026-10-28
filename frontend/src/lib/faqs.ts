export type Faq = { question: string; answer: string };

type FaqRecord = { question: unknown; answer: unknown; sub_page: unknown };

function isFaqRecord(value: unknown): value is FaqRecord {
  return !!value && typeof value === "object" && typeof (value as FaqRecord).question === "string" && typeof (value as FaqRecord).answer === "string";
}

/**
 * Public FAQs for one page or sub-page, in the backend's display order.
 * The backend only returns active records. Asking for a page without a sub-page returns
 * every record under that page, so the main page keeps only records with no sub_page.
 * Failures and empty results return an empty list; there is no hardcoded fallback.
 */
export async function getFaqs(page: string, subPage?: string): Promise<Faq[]> {
  const base = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
  const query = new URLSearchParams({ page });
  if (subPage) query.set("sub_page", subPage);
  try {
    const response = await fetch(`${base}/faqs?${query}`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) return [];
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !Array.isArray((payload as { data?: unknown }).data)) return [];
    return ((payload as { data: unknown[] }).data)
      .filter(isFaqRecord)
      .filter(faq => subPage ? true : faq.sub_page == null)
      .map(({ question, answer }) => ({ question: question as string, answer: answer as string }));
  } catch {
    return [];
  }
}
