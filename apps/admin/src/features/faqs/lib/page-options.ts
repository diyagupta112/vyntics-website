import { servicePages } from "@/lib/content/service-pages";

/** Editorial choices, not a closed set of valid backend pages. Extend in `@/lib/content/service-pages`. */
export const faqPageOptions: ReadonlyArray<{ label: string; value: string }> = servicePages.map(page => ({ label: page.name, value: page.page }));

export function faqPageLabel(page: string): string {
  return faqPageOptions.find(option => option.value === page)?.label ?? page;
}

export function faqPageChoices(keys: readonly string[] = []) {
  const options = [...faqPageOptions];
  const seen = new Set(options.map(option => option.value));
  for (const key of keys) {
    if (key && !seen.has(key)) {
      options.push({ label: faqPageLabel(key), value: key });
      seen.add(key);
    }
  }
  return options;
}

/** Configured sub-pages of a page. */
export function faqSubPageOptions(page: string): ReadonlyArray<{ label: string; value: string }> {
  return (servicePages.find(config => config.page === page)?.subPages ?? []).map(sub => ({ label: sub.name, value: sub.key }));
}

/** Sub-page label within a page, or the raw key when it is not configured. */
export function faqSubPageLabel(page: string, subPage: string): string {
  return faqSubPageOptions(page).find(option => option.value === subPage)?.label ?? subPage;
}

/** Configured sub-pages plus the current value, so an unknown existing sub-page is never dropped. */
export function faqSubPageChoices(page: string, current = "") {
  const options = [...faqSubPageOptions(page)];
  if (current && !options.some(option => option.value === current)) options.push({ label: `${current} (existing)`, value: current });
  return options;
}
