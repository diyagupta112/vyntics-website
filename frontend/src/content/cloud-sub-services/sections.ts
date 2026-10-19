import type { CloudSubPageKey } from "./pages";

/** Content and fallback limits belong only to the three Cloud sub-service pages. */
export const cloudReferenceSections = {
  caseStudies: {
    eyebrow: "Case studies",
    introduction: "Explore how we’ve helped businesses solve complex technology challenges and turn them into practical outcomes.",
    relevantLimit: 1,
    recentLimit: 2,
    emptyText: "We're adding case studies for this service. Explore our other projects in the meantime.",
    link: { href: "/case-studies", label: "View all case studies" },
  },
  insights: {
    eyebrow: "Related insights",
    relevantLimit: 3,
    recentLimit: 3,
    emptyText: "We're adding insights for this topic. Browse the latest from our blog in the meantime.",
    link: { href: "/blog", label: "Visit the blog" },
  },
} as const;

export const cloudReferenceHeadings: Record<CloudSubPageKey, { caseStudies: string; insights: string }> = {
  migration: { caseStudies: "Cloud migration case studies", insights: "Cloud migration insights" },
  devops: { caseStudies: "DevOps case studies", insights: "DevOps insights" },
  cost: { caseStudies: "Cloud cost optimization case studies", insights: "Cloud cost optimization insights" },
};
