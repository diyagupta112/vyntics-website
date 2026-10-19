import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import { ServicePillarApproach } from "@/components/pages/service-pillar-sections";
import { PathToResilienceOrbitalTimeline } from "@/components/ui/path-to-resilience-orbital-timeline";
import { MigrationEngagementOptions } from "./migration-engagement-options";
import { MigrationArchitecture } from "./migration-architecture";
import { DevopsPipeline } from "./devops-pipeline";
import { ServiceTools } from "@/components/pages/service-tools";
import { ServiceCaseStudyGallery } from "@/components/pages/service-case-study-gallery";
import { RelatedBlogCard } from "@/components/pages/related-blog-card";
import { FaqContent } from "@/components/pages/faq-content";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { cloudSubPages, type CloudSubPageKey } from "@/content/cloud-sub-services/pages";
import { getCloudReferences, resolveCloudReferenceSections } from "@/content/cloud-sub-services/references";
import { cloudReferenceSections, cloudReferenceHeadings } from "@/content/cloud-sub-services/sections";
import { cloudSubStructuredData } from "@/content/cloud-sub-services/seo";
import { CloudSubHero } from "./hero";
import { DraftCardSection, DraftToolLinks } from "./draft-sections";
import sectionStyles from "@/app/(marketing)/services/data/page.module.css";
import cloudStyles from "@/app/(marketing)/services/cloud/page.module.css";
import studyStyles from "@/app/(marketing)/case-studies/page.module.css";
import styles from "./service-sub.module.css";
import { costEngagementDetails, devopsEngagementDetails } from "./migration-engagement-options.data";

/** All copy and page ordering are supplied by the Cloud sub-service data. */
export async function CloudSubServicePage({ pageKey }: { pageKey: CloudSubPageKey }) {
  const page = cloudSubPages[pageKey];
  const references = await getCloudReferences();
  const { studies, insights, studiesState, insightsState } = resolveCloudReferenceSections(references, pageKey, { strictRelevance: pageKey === "devops" || pageKey === "cost" });
  const headings = cloudReferenceHeadings[pageKey];
  const studySection = cloudReferenceSections.caseStudies;
  const insightSection = cloudReferenceSections.insights;
  const contentId = `${pageKey}-content`;
  const serviceEngagementDetails = pageKey === "devops" ? devopsEngagementDetails : pageKey === "cost" ? costEngagementDetails : undefined;
  const serviceEngagementSteps = serviceEngagementDetails
    ? page.engagements.items.flatMap((item, index) => {
      const details = serviceEngagementDetails[index];
      return details ? [{ ...details, title: item.title, description: item.description }] : [];
    })
    : undefined;
  return <div className={styles.page} data-cloud-sub-page={pageKey}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cloudSubStructuredData(page)).replace(/</g, "\\u003c") }} />
    <CloudSubHero page={page} />
    <div id={contentId}>
      <DraftCardSection section={page.signs} variant={pageKey === "migration" || pageKey === "devops" || pageKey === "cost" ? "diagnostic" : "signs"} signalEyebrow={pageKey === "devops" ? "DevOps signals" : "Cloud signals"} />
      {page.offerings.map(section => <DraftCardSection section={section} key={section.id} variant={pageKey === "devops" || pageKey === "migration" && ["architecture-services", "migration-services"].includes(section.id) || pageKey === "cost" && ["cost-services", "finops"].includes(section.id) ? "services" : "cards"} />)}
      <div id={`${pageKey}-process`} className={styles.process}>
        {pageKey === "migration" || pageKey === "devops" || pageKey === "cost"
          ? <PathToResilienceOrbitalTimeline showStepNumbers eyebrow="How we work" title={page.process.title} headingId={`${pageKey}-process-title`} description={page.process.introduction}
              steps={page.process.steps.map(step => ({ title: step.title, label: step.visual, description: step.description }))} />
          : <ServicePillarApproach presentation="workflow" heading={page.process.title} headingId={`${pageKey}-process-title`} introduction={page.process.introduction} process={page.process.steps} />}
      </div>
      {pageKey === "migration" && page.diagram && <MigrationArchitecture />}
      {pageKey === "devops" && <DevopsPipeline />}
      {page.platforms && <div className={pageKey === "migration" ? styles.migrationPlatforms : undefined} data-reveal={`${pageKey}-platforms`}><ServiceTools presentation="platforms" balancedPlatforms showTechnologyLinks name={page.name} title={page.platforms.title} introduction={page.platforms.introduction} technologies={page.platforms.items.map(item => item.name)} details={page.platforms.items} /></div>}
      {page.tools && pageKey === "devops" && <ServiceTools presentation="platforms" balancedPlatforms showTechnologyLinks name={page.name} title="Tools we use" introduction="We use tools that make delivery, infrastructure changes, and service health easier to review and operate." technologies={page.tools} />}
      {page.tools && pageKey !== "devops" && <DraftToolLinks presentation="editorial" tools={page.tools} pageKey={pageKey} />}
      <DraftCardSection section={page.results} variant={pageKey === "migration" || pageKey === "devops" || pageKey === "cost" ? "connected" : "cards"}
        visual={pageKey === "devops" ? { src: "/images/services/sub-services/benefits/devops-and-reliability.jpg", alt: "Colleagues reviewing work together around a laptop during a planning session" } : pageKey === "cost" ? { src: "/images/services/sub-services/benefits/cloud-cost-optimization.jpg", alt: "Colleagues gathered around a laptop, reviewing work together" } : undefined} />
      <section className={cloudStyles.workBridge} aria-labelledby={`${pageKey}-study-title`} data-cloud-sub-studies data-content-state={studiesState}>
        <Container>
          <header className={cloudStyles.sectionHeading} data-reveal={`${pageKey}-study-heading`}><p className={cloudStyles.eyebrow}>{studySection.eyebrow}</p><h2 id={`${pageKey}-study-title`}>{headings.caseStudies}</h2><p className={cloudStyles.contentState}>{studySection.introduction}</p></header>
          {studies.length ? <ServiceCaseStudyGallery studies={studies} /> : <ReferenceEmptyState text={studySection.emptyText} link={studySection.link} />}
        </Container>
      </section>
      {pageKey === "migration" ? <MigrationEngagementOptions /> : serviceEngagementSteps
        ? <MigrationEngagementOptions sectionId={page.engagements.id} title={page.engagements.title} introduction={page.engagements.introduction} steps={serviceEngagementSteps} />
        : <DraftCardSection section={page.engagements} />}
      <section className={cloudStyles.context} aria-labelledby={`${pageKey}-insights-title`} data-cloud-sub-insights data-content-state={insightsState}>
        <Container><header className={cloudStyles.sectionHeading} data-reveal={`${pageKey}-insights-heading`}><p className={cloudStyles.eyebrow}>{insightSection.eyebrow}</p><h2 id={`${pageKey}-insights-title`}>{headings.insights}</h2></header>
          {insights.length ? <div className={studyStyles.otherGrid}>{insights.map(post => <RelatedBlogCard key={post.id} blog={post} variant="service" />)}</div> : <ReferenceEmptyState text={insightSection.emptyText} link={insightSection.link} />}
        </Container>
      </section>
      <section className={`${sectionStyles.section} ${styles.section}`} aria-labelledby={`${pageKey}-faq-title`} data-reveal={`${pageKey}-faq`}>
        <FaqContent heading={<><h2 id={`${pageKey}-faq-title`}>Frequently asked questions</h2><p className={styles.faqIntro}>Practical answers about {page.name.toLowerCase()}.</p><p className={styles.faqContact}>Have a question about your environment? <a href="mailto:contact@vyntics.com">Contact our team</a>.</p></>}
          items={page.faqs} name={`${pageKey}-faq`} label={`${page.name} questions`} />
      </section>
      <DraftCardSection section={page.related} />
      <div data-reveal={`${pageKey}-contact`}><ContactCta eyebrow={page.name} title={page.contact.title} intro={page.contact.introduction} submitLabel={page.contact.submitLabel} sectionId="contact" /></div>
    </div>
    <ScrollReveals scope={`#${contentId}`} />
  </div>;
}

function ReferenceEmptyState({ text, link }: { text: string; link: { href: string; label: string } }) {
  return <div className={styles.referenceEmpty}>
    <p>{text}</p>
    <Link className={cloudStyles.primaryAction} href={link.href}>{link.label} <span aria-hidden="true">→</span></Link>
  </div>;
}
