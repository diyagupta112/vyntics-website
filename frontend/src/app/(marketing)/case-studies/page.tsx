import { Suspense } from "react";
import { CaseStudySectionsSkeleton } from "./case-studies-skeleton";
import { CaseStudiesHero, CaseStudiesIntro } from "./case-studies-static";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { getCaseStudies, getCaseStudy, getCaseStudyHeroMedia } from "@/lib/case-studies";
import { FeaturedCaseStudyCarousel } from "@/components/sections/case-studies/featured-case-study-carousel";
import { CaseStudiesListing } from "./case-studies-listing";
import { CaseStudyScrollReveal } from "./scroll-reveal";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
const pageTitle = "Case Studies: Data, AI & Cloud Projects | Vyntics";
const pageDescription = "Explore Vyntics case studies: real data, AI, cloud and analytics projects built into production-grade systems. See the problems we solved and how.";
const pageUrl = "https://vyntics.com/case-studies";
export const metadata: Metadata = {
  title: { absolute: pageTitle }, description: pageDescription,
  alternates: { canonical: pageUrl },
  openGraph: { title: pageTitle, description: pageDescription, type: "website", url: pageUrl },
  twitter: { card: "summary_large_image", title: pageTitle, description: pageDescription },
};

async function CaseStudySections() {
  const studies = await getCaseStudies();
  const featured = studies.filter((study) => study.featured === true);
  const showcased = await Promise.all(featured.map(async (study) => ({ ...study, media: getCaseStudyHeroMedia(await getCaseStudy(study.slug)) })));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://vyntics.com" },
            { "@type": "ListItem", position: 2, name: "Case Studies", item: pageUrl },
          ] },
          { "@type": "CollectionPage", name: "Case Studies", description: pageDescription, url: pageUrl,
            mainEntity: { "@type": "ItemList", itemListElement: studies.map((study, index) => ({
              "@type": "ListItem", position: index + 1, name: study.title, url: `${pageUrl}/${encodeURIComponent(study.slug)}`,
            })) } },
        ],
      }).replace(/</g, "\\u003c") }} />
      <section id="featured-case-studies" className={styles.featuredSection} aria-labelledby="featured-title">
        <CaseStudyScrollReveal>
        <Container>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Selected work</p><h2 id="featured-title">Featured Case Studies</h2></div></div>
          <p className={styles.sectionIntro}>A selection of projects that show how we take a business problem from the first conversation to a system running in production.</p>
          {featured.length > 0 ? <FeaturedCaseStudyCarousel studies={showcased} caseStudySeo /> : <p className={styles.otherEmpty}>{studies.length ? "Explore our published work below." : "No case studies available yet."}</p>}
        </Container>
        </CaseStudyScrollReveal>
      </section>
      <section className={styles.otherSection} aria-labelledby="more-title">
        <CaseStudyScrollReveal>
        <Container>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Explore further</p><h2 id="more-title">All Case Studies</h2></div></div>
          <p className={styles.sectionIntro}>Browse every project, or search and filter by technology and topic.</p>
          <CaseStudiesListing studies={studies} />
        </Container>
        </CaseStudyScrollReveal>
      </section>
    </>
  );
}

export default function CaseStudiesPage() {
  return (
    <>
      <CaseStudiesHero />
      <CaseStudiesIntro />
      <Suspense fallback={<CaseStudySectionsSkeleton />}>
        <CaseStudySections />
      </Suspense>
      <CaseStudyScrollReveal>
      <ContactCta eyebrow="" showEyebrowAccent={false} title="Have a similar challenge? Talk to our experts."
        intro="Tell us what you're trying to solve. Talk directly with our experts about your data, AI, cloud or analytics project. It's a straight conversation about what's possible and what it would take, with no sales pitch." />
      </CaseStudyScrollReveal>
      <ScrollReveals scope="main" />
    </>
  );
}
