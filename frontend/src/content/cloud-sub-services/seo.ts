import type { Metadata } from "next";
import type { CloudSubPage } from "./pages";
import { resolveSubHeroImage } from "./assets";

export const cloudSubUrl = (page: CloudSubPage) => `https://vyntics.com/services/cloud-foundations/${page.slug}`;

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

export function cloudSubStructuredData(page: CloudSubPage) {
  const url = cloudSubUrl(page);
  const graph: Record<string, unknown>[] = [
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://vyntics.com/" },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://vyntics.com/#services" },
      { "@type": "ListItem", position: 3, name: "Cloud Foundations", item: "https://vyntics.com/services/cloud-foundations" },
      { "@type": "ListItem", position: 4, name: page.name, item: url },
    ] },
    { "@type": "Service", "@id": `${url}#service`, name: page.name, serviceType: page.keyword, description: page.hero.introduction, url,
      provider: { "@type": "Organization", name: "Vyntics", url: "https://vyntics.com" } },
    { "@type": "FAQPage", mainEntity: page.faqs.map(faq => ({ "@type": "Question", name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
  ];
  if (page.key === "migration") graph.push({
    "@type": "HowTo", name: page.process.title, description: page.process.introduction,
    step: page.process.steps.map((step, index) => ({ "@type": "HowToStep", position: index + 1, name: step.title, text: step.description, url: `${url}#migration-process` })),
  });
  return { "@context": "https://schema.org", "@graph": graph };
}
