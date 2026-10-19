import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import { PathToResilienceOrbitalTimeline } from "@/components/ui/path-to-resilience-orbital-timeline";
import { CloudSubHero } from "@/components/service-sub/hero";
import { DraftCardSection } from "@/components/service-sub/draft-sections";
import { MigrationEngagementOptions } from "@/components/service-sub/migration-engagement-options";
import { CrmPlatformComparison } from "./crm-platform-comparison";
import { CrmIntegrationArchitecture } from "@/components/service-sub/crm-integration";
import { ServiceCaseStudyGallery } from "@/components/pages/service-case-study-gallery";
import { RelatedBlogCard } from "@/components/pages/related-blog-card";
import { FaqContent } from "@/components/pages/faq-content";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { ServiceTools } from "@/components/pages/service-tools";
import { getBlogs } from "@/lib/blogs";
import { getCaseStudies, type CaseStudyListItem } from "@/lib/case-studies";
import { crmEngagements, crmFaqs, crmPlatforms, crmProcess, crmSections, crmImplementationService } from "./content";
import sectionStyles from "@/app/(marketing)/services/data/page.module.css";
import cloudStyles from "@/app/(marketing)/services/cloud/page.module.css";
import studyStyles from "@/app/(marketing)/case-studies/page.module.css";
import styles from "./page.module.css";
import subStyles from "@/components/service-sub/service-sub.module.css";

export const metadata: Metadata = {
  title: crmImplementationService.seoTitle,
  description: crmImplementationService.seoDescription,
  keywords: ["CRM implementation services", "CRM integration services", "Salesforce implementation", "HubSpot implementation", "Zoho CRM implementation", "CRM migration services", "CRM customization"],
  alternates: { canonical: "/services/crm-revenue-ops/crm-implementation-integration" },
};

const crmRelevance = /\b(crm|salesforce|hubspot|zoho|dynamics|customer relationship|migration)\b/i;

export default async function CrmImplementationIntegrationPage() {
  const [caseStudies, blogResult] = await Promise.all([
    getCaseStudies("crm_revenue_ops").catch(() => [] as CaseStudyListItem[]),
    getBlogs("crm_revenue_ops"),
  ]);
  const studies = caseStudies.filter(study => crmRelevance.test([study.title, study.excerpt, ...study.tags, ...study.tech_stack].join(" "))).slice(0, 1);
  const insights = blogResult.blogs.filter(post => (!post.status || post.status === "published") && crmRelevance.test(`${post.title} ${post.category} ${post.excerpt}`)).slice(0, 3);
  const contentId = "crm-implementation-content";
  const heroPage = { ...crmImplementationService, key: "crm-implementation-integration" };

  return <div className={styles.page} data-crm-sub-page="crm-implementation-integration">
    <CloudSubHero page={heroPage} />
    <div id={contentId}>
      <DraftCardSection section={crmSections.signs} variant="diagnostic" signalEyebrow="" />
      <DraftCardSection section={crmSections.implementation} variant="services" />
      <DraftCardSection section={crmSections.integrations} variant="services" />
      <CrmPlatformComparison />
      <section className={`${sectionStyles.section} ${styles.process}`} aria-labelledby="crm-process-title" id="crm-process">
        <PathToResilienceOrbitalTimeline showStepNumbers eyebrow="How we work" title="Our process" headingId="crm-process-title" description="A clear path from CRM decisions to a setup your team can use and improve." steps={crmProcess.map(step => ({ title: step.title, label: step.visual, description: step.description }))} />
      </section>
      <CrmIntegrationArchitecture />
      <PlatformSection />
      <DraftCardSection section={crmSections.results} variant="connected" visual={{ src: "/images/services/sub-services/benefits/crm-implementaion-and-integration.jpg", alt: "Team reviewing connected CRM information" }} />
      <section className={cloudStyles.workBridge} aria-labelledby="crm-case-study-title">
        <Container><header className={cloudStyles.sectionHeading} data-reveal="crm-case-study-heading"><p className={cloudStyles.eyebrow}>Case study</p><h2 id="crm-case-study-title">CRM implementation case study</h2><p className={cloudStyles.contentState}>Explore published work relevant to CRM, customer data, or revenue operations.</p></header>{studies.length ? <ServiceCaseStudyGallery studies={studies} /> : <ReferenceEmptyState text="No published CRM-related case study is available yet. Explore other Vyntics projects in the meantime." href="/case-studies" label="View all case studies" />}</Container>
      </section>
      <MigrationEngagementOptions sectionId="crm-implementation-engagement" title="Choose the right starting point" introduction="Start with a CRM audit, move into implementation, or discuss ongoing support for your customer operations." steps={crmEngagements} />
      <section className={cloudStyles.context} aria-labelledby="crm-insights-title"><Container><header className={cloudStyles.sectionHeading} data-reveal="crm-insights-heading"><p className={cloudStyles.eyebrow}>Related insights</p><h2 id="crm-insights-title">CRM implementation insights</h2></header>{insights.length ? <div className={studyStyles.otherGrid}>{insights.map(post => <RelatedBlogCard key={post.id} blog={post} variant="service" />)}</div> : <ReferenceEmptyState text="We're adding published insights about CRM implementation and integration. Browse the latest from our blog in the meantime." href="/blog" label="Visit the blog" />}<Link className={cloudStyles.primaryAction} href="/blog">View all insights <span aria-hidden="true">→</span></Link></Container></section>
      <section className={`${sectionStyles.section} ${subStyles.section}`} aria-labelledby="crm-faq-title"><FaqContent heading={<><h2 id="crm-faq-title">Frequently asked questions</h2><p className={subStyles.faqIntro}>Answers about CRM implementation services and integrations.</p><p className={subStyles.faqContact}>Have a question about your CRM plans? <a href="mailto:contact@vyntics.com">Contact our team</a>.</p></>} items={crmFaqs} name="crm-implementation-faq" label="CRM implementation questions" /></section>
      <DraftCardSection section={crmSections.related} />
      <div data-reveal="crm-contact"><ContactCta eyebrow="CRM implementation services" title="Build a CRM your team can rely on" intro="Tell us what you want to improve, connect, or migrate. We can discuss a practical next step for your CRM implementation." submitLabel="Discuss CRM implementation" sectionId="contact" /></div>
    </div>
    <ScrollReveals scope={`#${contentId}`} />
  </div>;
}

function PlatformSection() {
  return <ServiceTools id="crm-platforms" name={crmImplementationService.name} eyebrow="Platforms" title="Platforms" introduction="We help teams evaluate and implement the CRM platform that fits their processes, users, data, and connected systems."
    technologies={crmPlatforms.map(platform => platform.name)} details={crmPlatforms} presentation="platforms" balancedPlatforms showTechnologyLinks note={null} revealPrefix="crm-platform" headingReveal="crm-platforms-heading" />;
}

function ReferenceEmptyState({ text, href, label }: { text: string; href: string; label: string }) { return <div className={subStyles.referenceEmpty}><p>{text}</p><Link className={cloudStyles.primaryAction} href={href}>{label} <span aria-hidden="true">→</span></Link></div>; }
