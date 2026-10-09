import type { Metadata } from "next";
import { FaqContent } from "@/components/pages/faq-content";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { recognitionFaqs, recognitionBenefits } from "@/content/recognitions";
import { Capabilities } from "@/components/sections/home/capabilities";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { FeaturedWork } from "@/components/sections/home/featured-work";
import { getCaseStudies } from "@/lib/case-studies";
import { Suspense, type CSSProperties } from "react";
import { getBadges } from "@/lib/badges";
import { RecognitionsHero } from "@/components/sections/recognitions/recognitions-hero";
import { RecognitionCarousel } from "@/components/sections/recognitions/recognition-carousel";
import local from "./page.module.css";
import faqSupport from "../services/cloud/cloud-faq.module.css";
import careers from "../careers/page.module.css";
import surface from "@/components/sections/recognitions/recognition-card-surface.module.css";

const title = "Recognitions & Certifications | Vyntics Technology Experts";
const description = "A certified team across data, AI, cloud, CRM and analytics. Vyntics is a ChatGPT Select Partner and Databricks Partner. Book a free call.";
const url = "https://vyntics.com/recognitions";
// Set an approved badge-based image here once the actual assets are available.
const shareImage: string | undefined = undefined;
export const metadata: Metadata = {
  title: { absolute: title }, description,
  alternates: { canonical: url },
  openGraph: { type: "website", siteName: "Vyntics", title, description, url, ...(shareImage ? { images: [shareImage] } : {}) },
  twitter: { card: shareImage ? "summary_large_image" : "summary", title, description, ...(shareImage ? { images: [shareImage] } : {}) },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://vyntics.com/#organization", name: "Vyntics", url: "https://vyntics.com" },
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name: title, description, about: { "@id": "https://vyntics.com/#organization" }, breadcrumb: { "@id": `${url}#breadcrumb` } },
    { "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://vyntics.com" },
      { "@type": "ListItem", position: 2, name: "Recognitions", item: url },
    ] },
    { "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: recognitionFaqs.filter(faq => faq.schemaReady).map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
  ],
};

function FeatureIcon({ index }: { index: number }) {
  const paths = [
    "m8 12 3 3 5-6M12 3l7 3v6c0 4-7 8-7 8s-7-4-7-8V6l7-3Z",
    "M5 5h5v5H5zM14 14h5v5h-5zM7 10v6h7M10 7h6v7",
    "M5 17 17 5M8 5h9v9M5 5v14h14",
    "m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5",
    "M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-3a6 6 0 0 1 12 0v3M17 4a4 4 0 0 1 0 8M17 15a5 5 0 0 1 5 5v1",
  ];
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[index % paths.length]} /></svg>;
}

async function RecognitionCards() {
  let badges: Awaited<ReturnType<typeof getBadges>>;
  try {
    badges = await getBadges();
  } catch {
    return <p className={local.recognitionStatus} role="status">Recognitions are temporarily unavailable. Please try again later.</p>;
  }
  return <RecognitionCarousel badges={badges} />;
}

const productionDescription = "Recognition matters because of what it lets us build. Here is a selection of projects we've delivered for clients across different technologies. Each one shows how we turn a business problem into a working solution.";

async function ProductionWork() {
  let studies: Awaited<ReturnType<typeof getCaseStudies>> = [];
  let unavailable = false;
  try {
    studies = await getCaseStudies();
  } catch {
    unavailable = true;
  }
  return <FeaturedWork studies={studies} heading="Work We Deliver in Production" description={productionDescription} unavailable={unavailable} />;
}

export default function RecognitionsPage() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <div className={local.pageRhythm}>
    <RecognitionsHero />
    <section className={local.section} aria-labelledby="recognitions-title">
      <Container>
        <div className={local.sectionHeading}><p className={local.eyebrow}>OUR RECOGNITIONS AND CERTIFICATIONS</p><h2 id="recognitions-title">Our Recognitions and Certifications</h2></div>
        <p className={local.copy}>These recognitions come from the platforms we build on. They reflect the skills of our team and the quality of the solutions we deliver for clients.</p>
        <Suspense fallback={<p className={local.recognitionStatus} role="status" aria-live="polite">Loading recognitions…</p>}>
          <RecognitionCards />
        </Suspense>
      </Container>
    </section>
    <section className={local.section} aria-labelledby="business-title">
      <Container>
        <div className={local.sectionHeading}><h2 id="business-title">What This Means for Your Business</h2></div>
        <p className={local.copy}>Working with a recognized and certified team lowers risk on projects that matter.</p>
        <div className={local.benefitGrid}>
          <figure className={local.benefitVisual}>
            <Image
              src="/images/recognitions/what-this-means-for-you.jpg"
              alt="A team collaborating around a laptop to review their work"
              fill
              sizes="(max-width: 540px) 84vw, (max-width: 900px) 320px, 28vw"
            />
          </figure>
          {recognitionBenefits.map((benefit, index) => <div className={`${careers.openingCard} ${local.benefit} ${surface.surface} ${surface.bottomScrim}`} data-position={index} key={benefit.title}
            style={{ "--benefit-gradient": 'url("/images/diagonal-sweep-gradient.webp")', "--benefit-gradient-transform": "none" } as CSSProperties}>
            <span className={local.icon}><FeatureIcon index={index} /></span>
            <div><h3>{benefit.title}</h3><p>{benefit.description}</p></div>
          </div>)}
        </div>
      </Container>
    </section>
    <Suspense fallback={<FeaturedWork loading studies={[]} heading="Work We Deliver in Production" description={productionDescription} />}>
      <ProductionWork />
    </Suspense>
    <div id="services" className={local.servicesGroup}>
    <section className={local.section} aria-labelledby="explore-build-title">
      <Container>
        <div className={local.sectionHeading}><h2 id="explore-build-title">Explore What We Can Build for You</h2></div>
        <p className={local.copy}>Whatever you&apos;re working on, our team can design, build and support it.</p>
      </Container>
    </section>
    <Capabilities showHeading={false} linkCards cardsOnly sectionId="recognitions-service-cards" />
    </div>
    <section className={local.section} aria-labelledby="faq-title">
      <FaqContent
        heading={<>
          <h2 id="faq-title">FAQs</h2>
          <p className={faqSupport.introduction}>Have questions about our services, approach, or what working with Vyntics looks like? Find answers to some of the questions we hear most often.</p>
          <div className={faqSupport.contactFallback}>
            <p className={faqSupport.contactPrompt}>Can’t find the answer you’re looking for?</p>
            <p className={faqSupport.contactHelp}>Reach out to us at <span className={local.faqEmail}>contact@vyntics.com</span> and we’ll be happy to help.</p>
          </div>
        </>}
        items={recognitionFaqs}
        name="recognitions-faq"
        label="Recognition questions"
      />
    </section>
    <div className={local.contactSection}>
      <ContactCta showEyebrowAccent={false} sectionId="strategy-call" />
    </div>
    </div>
  </>;
}
