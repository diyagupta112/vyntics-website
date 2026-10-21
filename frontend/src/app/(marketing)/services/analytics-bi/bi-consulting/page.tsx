import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import { PathToResilienceOrbitalTimeline } from "@/components/ui/path-to-resilience-orbital-timeline";
import { CloudSubHero } from "@/components/service-sub/hero";
import { DraftCardSection } from "@/components/service-sub/draft-sections";
import { MigrationEngagementOptions } from "@/components/service-sub/migration-engagement-options";
import { BiToolComparison } from "./bi-tool-comparison";
import { ServiceCaseStudyGallery } from "@/components/pages/service-case-study-gallery";
import { RelatedBlogCard } from "@/components/pages/related-blog-card";
import { FaqContent } from "@/components/pages/faq-content";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { getBlogs } from "@/lib/blogs";
import { getCaseStudies, type CaseStudyListItem } from "@/lib/case-studies";
import {
  biConsultingSections,
  biConsultingService,
  biEngagements,
  biFaqs,
  biProcess,
} from "./content";
import sectionStyles from "@/app/(marketing)/services/data/page.module.css";
import cloudStyles from "@/app/(marketing)/services/cloud/page.module.css";
import studyStyles from "@/app/(marketing)/case-studies/page.module.css";
import subStyles from "@/components/service-sub/service-sub.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: biConsultingService.seoTitle,
  description: biConsultingService.seoDescription,
  alternates: { canonical: "/services/analytics-bi/bi-consulting" },
};

const biRelevance = /\b(bi|business intelligence|power bi|tableau|quicksight|analytics|report(?:ing)?|dashboard)\b/i;
const insightRelevance = /\b(power bi|tableau|quicksight|business intelligence|bi tool|excel)\b/i;

export default async function BiConsultingPage() {
  const [caseStudies, blogResult] = await Promise.all([
    getCaseStudies("analytics_bi").catch(() => [] as CaseStudyListItem[]),
    getBlogs("analytics_bi"),
  ]);
  const studies = caseStudies
    .filter(study => biRelevance.test([study.title, study.excerpt, ...study.tags, ...study.tech_stack].join(" ")))
    .slice(0, 1);
  const insights = blogResult.blogs
    .filter(post => (!post.status || post.status === "published") && insightRelevance.test(`${post.title} ${post.category} ${post.excerpt}`))
    .slice(0, 3);
  const contentId = "bi-consulting-content";

  return <div className={styles.page} data-analytics-sub-page="bi-consulting">
    <CloudSubHero page={biConsultingService} showOutcome={false} />
    <div id={contentId}>
      <DraftCardSection section={biConsultingSections.signs} variant="diagnostic" signalEyebrow="" />

      <DraftCardSection section={biConsultingSections.powerBi} variant="services" />
      <DraftCardSection section={biConsultingSections.tableau} variant="services" />
      <DraftCardSection section={biConsultingSections.quickSight} variant="services" />

      <BiToolComparison />

      <DraftCardSection section={biConsultingSections.services} variant="services" />

      <div id="bi-consulting-process" className={styles.process}>
        <PathToResilienceOrbitalTimeline
          showStepNumbers
          eyebrow="How we work"
          title="Our process"
          headingId="bi-consulting-process-title"
          description="A clear path from understanding the current BI environment to implementation, adoption, and ongoing support."
          steps={biProcess.map(step => ({ title: step.title, label: step.visual, description: step.description }))}
        />
      </div>

      <DraftCardSection section={biConsultingSections.results} variant="connected" visual={{ src: "/images/services/sub-services/benefits/bi-consulting.jpg", alt: "Colleagues reviewing business intelligence reporting together" }} />

      <section className={cloudStyles.workBridge} aria-labelledby="bi-case-study-title" data-bi-case-studies>
        <Container>
          <header className={cloudStyles.sectionHeading} data-reveal="bi-case-study-heading">
            <p className={cloudStyles.eyebrow}>Case study</p>
            <h2 id="bi-case-study-title">BI and analytics case study</h2>
            <p className={cloudStyles.contentState}>Explore published work relevant to business intelligence, reporting, or analytics.</p>
          </header>
          {studies.length
            ? <ServiceCaseStudyGallery studies={studies} />
            : <ReferenceEmptyState text="No published BI-focused case study is available yet. Explore other Vyntics projects in the meantime." href="/case-studies" label="View all case studies" />}
        </Container>
      </section>

      <MigrationEngagementOptions
        sectionId="bi-consulting-engagements"
        title="Choose the right starting point"
        introduction="Start with a BI health check, move into implementation, or discuss ongoing support for your reporting environment."
        steps={biEngagements}
      />

      <section className={cloudStyles.context} aria-labelledby="bi-insights-title" data-bi-insights>
        <Container>
          <header className={cloudStyles.sectionHeading} data-reveal="bi-insights-heading">
            <p className={cloudStyles.eyebrow}>Related insights</p>
            <h2 id="bi-insights-title">BI platform insights</h2>
          </header>
          {insights.length
            ? <div className={studyStyles.otherGrid}>{insights.map(post => <RelatedBlogCard key={post.id} blog={post} variant="service" />)}</div>
            : <ReferenceEmptyState text="We're adding published insights about BI platforms and implementation. Browse the latest from our blog in the meantime." href="/blog" label="Visit the blog" />}
          <Link className={cloudStyles.primaryAction} href="/blog">View all insights <span aria-hidden="true">→</span></Link>
        </Container>
      </section>

      <section className={`${sectionStyles.section} ${subStyles.section}`} aria-labelledby="bi-consulting-faq-title" data-reveal="bi-consulting-faq">
        <FaqContent
          heading={<><h2 id="bi-consulting-faq-title">Frequently asked questions</h2><p className={subStyles.faqIntro}>Answers about BI platforms, implementation, migration, training, and ongoing support.</p><p className={subStyles.faqContact}>Have a question about your BI environment? <a href="mailto:contact@vyntics.com">Contact our team</a>.</p></>}
          items={biFaqs}
          name="bi-consulting-faq"
          label="BI consulting questions"
        />
      </section>

      <DraftCardSection section={biConsultingSections.relatedServices} />
      <div data-reveal="bi-consulting-contact">
        <ContactCta
          eyebrow="BI consulting"
          title="Build a BI environment your team can use"
          intro="Tell us which BI platform you use or are considering, what is not working today, and who relies on the reports. We can discuss a practical next step for selection, implementation, migration, or support."
          submitLabel="Discuss BI consulting"
          sectionId="contact"
        />
      </div>
    </div>
    <ScrollReveals scope={`#${contentId}`} />
  </div>;
}

function ReferenceEmptyState({ text, href, label }: { text: string; href: string; label: string }) {
  return <div className={subStyles.referenceEmpty}><p>{text}</p><Link className={cloudStyles.primaryAction} href={href}>{label} <span aria-hidden="true">→</span></Link></div>;
}
