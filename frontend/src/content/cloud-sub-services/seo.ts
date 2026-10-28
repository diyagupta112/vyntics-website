import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import type { CloudSubPage } from "./pages";
import { resolveSubHeroImage } from "./assets";

export const cloudSubUrl = (page: CloudSubPage) => `${SITE_URL}/services/cloud-foundations/${page.slug}`;

export function cloudSubMetadata(page: CloudSubPage): Metadata {
  const url = cloudSubUrl(page);
  const image = resolveSubHeroImage(page);
  return {
    title: { absolute: page.seoTitle }, description: page.seoDescription,
    alternates: { canonical: url },
    openGraph: { title: page.seoTitle, description: page.seoDescription, url, type: "website", siteName: "Vyntics", locale: "en_US", images: [{ url: image.src, alt: image.alt }] },
    twitter: { card: "summary_large_image", title: page.seoTitle, description: page.seoDescription, images: [{ url: image.src, alt: image.alt }] },
  };
}

export function cloudSubStructuredData(page: CloudSubPage, faqs: readonly { question: string; answer: string }[] = page.faqs) {
  const url = cloudSubUrl(page);
  const graph: Record<string, unknown>[] = [
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/#services` },
      { "@type": "ListItem", position: 3, name: "Cloud Foundations", item: `${SITE_URL}/services/cloud-foundations` },
      { "@type": "ListItem", position: 4, name: page.name, item: url },
    ] },
    { "@type": "Service", "@id": `${url}#service`, name: page.name, serviceType: page.keyword, description: page.hero.introduction, url,
      provider: { "@type": "Organization", name: "Vyntics", url: SITE_URL } },
  ];
  if (faqs.length) graph.push({ "@type": "FAQPage", mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer } })) });
  if (page.key === "migration") graph.push({
    "@type": "HowTo", name: page.process.title, description: page.process.introduction,
    step: page.process.steps.map((step, index) => ({ "@type": "HowToStep", position: index + 1, name: step.title, text: step.description, url: `${url}#migration-process` })),
  });
  return { "@context": "https://schema.org", "@graph": graph };
}
