import { Suspense } from "react";
import CaseStudiesLoading from "./loading";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { getCaseStudies, getCaseStudy, getCaseStudyHeroMedia } from "@/lib/case-studies";
import { FeaturedCaseStudyCarousel } from "@/components/sections/case-studies/featured-case-study-carousel";
import { CaseStudiesListing } from "./case-studies-listing";
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

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

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
        <Container>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Selected work</p><h2 id="featured-title">Featured Case Studies</h2></div></div>
          <p className={styles.sectionIntro}>A selection of projects that show how we take a business problem from the first conversation to a system running in production.</p>
          {featured.length > 0 ? <FeaturedCaseStudyCarousel studies={showcased} caseStudySeo /> : <p className={styles.otherEmpty}>{studies.length ? "Explore our published work below." : "No case studies available yet."}</p>}
        </Container>
      </section>
      <section className={styles.otherSection} aria-labelledby="more-title">
        <Container>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Explore further</p><h2 id="more-title">All Case Studies</h2></div></div>
          <p className={styles.sectionIntro}>Browse every project, or search and filter by technology and topic.</p>
          <CaseStudiesListing studies={studies} />
        </Container>
      </section>
    </>
  );
}

export default function CaseStudiesPage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="case-studies-title">
        <div className={styles.heroCarousel} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.heroImage} src="/images/case-studies/4.jpg" alt="" fetchPriority="high" />
        </div>
        <div className={styles.heroShade} aria-hidden="true" />
        <Container className={styles.heroInner}>
          <p className={styles.eyebrow}>Case studies</p>
          <h1 id="case-studies-title">Case Studies: Real Challenges Turned into Production-Grade Systems</h1>
          <p className={styles.heroLead}>A look inside the custom software, data platforms, AI and cloud infrastructure we engineer to solve critical business problems.</p>
          <a className={styles.heroAction} href="#featured-case-studies">View case studies <ArrowIcon /></a>
        </Container>
      </section>
      <section className={styles.workIntro} aria-labelledby="problems-title">
        <Container>
          <div className={styles.workIntroContent}>
          <h2 id="problems-title">Problems We&apos;ve Helped Solve</h2>
          <p className={styles.workIntroCopy}>Every business challenge needs a tailored approach, but the goal stays the same: turn operational friction into reliable, scalable systems. We work directly with client teams to build the custom software, data infrastructure, cloud environments and intelligent automation that support long-term growth.</p>
          </div>
        </Container>
      </section>
      <Suspense fallback={<div id="featured-case-studies"><CaseStudiesLoading /></div>}>
        <CaseStudySections />
      </Suspense>
      <ContactCta showEyebrowAccent={false} title="Have a similar challenge? Talk to our experts."
        intro="Tell us what you're trying to solve. Talk directly with our experts about your data, AI, cloud or analytics project. It's a straight conversation about what's possible and what it would take, with no sales pitch."
        primaryAction={{ href: "/contact", label: "Talk to our experts" }} />
    </>
  );
}
