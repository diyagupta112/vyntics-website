/** Editorial choices, not a closed set of valid backend pages. Extend here. */
export const faqPageOptions: ReadonlyArray<{ label: string; value: string }> = [
  { label: "Cloud Foundations", value: "services/cloud-foundations" },
  { label: "Data Engineering", value: "services/data-engineering" },
  { label: "Analytics & BI", value: "services/analytics-bi" },
  { label: "AI Solutions", value: "services/ai-solutions" },
  { label: "CRM & Revenue Ops", value: "services/crm-revenue-ops" },
];

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
