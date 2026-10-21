import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import { PathToResilienceOrbitalTimeline } from "@/components/ui/path-to-resilience-orbital-timeline";
import { CloudSubHero } from "@/components/service-sub/hero";
import { DraftCardSection } from "@/components/service-sub/draft-sections";
import { RagArchitecture } from "@/components/service-sub/rag-architecture";
import { MigrationEngagementOptions } from "@/components/service-sub/migration-engagement-options";
import { ServiceCaseStudyGallery } from "@/components/pages/service-case-study-gallery";
import { RelatedBlogCard } from "@/components/pages/related-blog-card";
import { FaqContent } from "@/components/pages/faq-content";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { ServiceTools } from "@/components/pages/service-tools";
import { getBlogs } from "@/lib/blogs";
import { getCaseStudies, type CaseStudyListItem } from "@/lib/case-studies";
import { ragEngagements, ragFaqs, ragProcess, ragSections, ragService, ragTools } from "./content";
import sectionStyles from "@/app/(marketing)/services/data/page.module.css";
import cloudStyles from "@/app/(marketing)/services/cloud/page.module.css";
import studyStyles from "@/app/(marketing)/case-studies/page.module.css";
import styles from "./page.module.css";
import subStyles from "@/components/service-sub/service-sub.module.css";

export const metadata: Metadata = { title: ragService.seoTitle, description: ragService.seoDescription, keywords: ["AI chatbot development services", "RAG development services", "AI knowledge assistant", "chatbot trained on company data", "enterprise AI search", "custom GPT for business", "document Q&A AI"], alternates: { canonical: "/services/ai-solutions/rag-knowledge-assistants" } };
const relevance = /\b(RAG|knowledge assistant|chatbot|document Q&A|AI search|AI|OpenAI|Claude|Gemini)\b/i;

export default async function RagKnowledgeAssistantsPage() {
  const [caseStudies, blogResult] = await Promise.all([getCaseStudies("ai_solutions").catch(() => [] as CaseStudyListItem[]), getBlogs("ai_solutions")]);
  const studies = caseStudies.filter(study => relevance.test([study.title, study.excerpt, ...study.tags, ...study.tech_stack].join(" "))).slice(0, 1);
  const insights = blogResult.blogs.filter(post => (!post.status || post.status === "published") && relevance.test(`${post.title} ${post.category} ${post.excerpt}`)).slice(0, 3);
  const contentId = "rag-content";
  const heroPage = { ...ragService, key: "rag-knowledge-assistants" };
  return <div className={styles.page} data-ai-sub-page="rag-knowledge-assistants"><CloudSubHero page={heroPage} opticalAlign showOutcome={false} /><div id={contentId}>
    <DraftCardSection section={ragSections.signs} variant="diagnostic" signalEyebrow="" />
    <DraftCardSection section={ragSections.builds} variant="services" />
    <RagArchitecture />
    <DraftCardSection section={ragSections.security} variant="services" />
    <ServiceTools id="rag-integrations" name={ragService.name} eyebrow="" title={ragSections.integrations.title} introduction={ragSections.integrations.introduction} technologies={ragSections.integrations.items.map(item => item.title)} details={ragSections.integrations.items.map(item => ({ name: item.title, description: item.description }))} presentation="platforms" balancedPlatforms note={null} revealPrefix="rag-integration" headingReveal="rag-integrations-heading" />
    <section className={`${sectionStyles.section} ${styles.section}`} id="rag-process" aria-labelledby="rag-process-title"><PathToResilienceOrbitalTimeline showStepNumbers eyebrow="How we work" title="Our process" headingId="rag-process-title" description="A clear path from a focused knowledge use case to an assistant your teams can evaluate and improve." steps={ragProcess.map(step => ({ title: step.title, label: step.visual, description: step.description }))} /></section>
    <ToolsSection />
    <DraftCardSection section={ragSections.results} variant="connected" visual={{ src: "/images/services/sub-services/benefits/rag-and-knowledge-assistants.jpg", alt: "Team reviewing an AI knowledge assistant and business information" }} />
    <section className={cloudStyles.workBridge} aria-labelledby="rag-case-study-title"><Container><header className={cloudStyles.sectionHeading} data-reveal="rag-case-study-heading"><p className={cloudStyles.eyebrow}>Case study</p><h2 id="rag-case-study-title">Knowledge assistant case study</h2><p className={cloudStyles.contentState}>Explore published work relevant to AI assistants, RAG, or knowledge workflows.</p></header>{studies.length ? <ServiceCaseStudyGallery studies={studies} /> : <ReferenceEmptyState text="No published RAG-related case study is available yet. Explore other Vyntics projects in the meantime." href="/case-studies" label="View all case studies" />}</Container></section>
    <MigrationEngagementOptions sectionId="rag-engagement" title="Choose the right starting point" introduction="Start with a focused pilot, move into a full build, or discuss ongoing support and improvement." steps={ragEngagements} />
    <section className={cloudStyles.context} aria-labelledby="rag-insights-title"><Container><header className={cloudStyles.sectionHeading} data-reveal="rag-insights-heading"><p className={cloudStyles.eyebrow}>Related insights</p><h2 id="rag-insights-title">RAG and knowledge assistant insights</h2></header>{insights.length ? <div className={studyStyles.otherGrid}>{insights.map(post => <RelatedBlogCard key={post.id} blog={post} variant="service" />)}</div> : <ReferenceEmptyState text="We're adding published insights about RAG and knowledge assistants. Browse the latest from our blog in the meantime." href="/blog" label="Visit the blog" />}<Link className={cloudStyles.primaryAction} href="/blog">View all insights <span aria-hidden="true">→</span></Link></Container></section>
    <section className={`${sectionStyles.section} ${subStyles.section}`} aria-labelledby="rag-faq-title"><FaqContent heading={<><h2 id="rag-faq-title">Frequently asked questions</h2><p className={subStyles.faqIntro}>Answers about AI chatbot development services and knowledge assistants.</p><p className={subStyles.faqContact}>Have a question about your AI use case? <a href="mailto:contact@vyntics.com">Contact our team</a>.</p></>} items={ragFaqs} name="rag-faq" label="Knowledge assistant questions" /></section>
    <DraftCardSection section={ragSections.related} /><div data-reveal="rag-contact"><ContactCta eyebrow="AI chatbot development services" title="Make your company knowledge easier to use" intro="Tell us what your teams search for, which content matters, and where an assistant could help. We can discuss a practical next step." submitLabel="Discuss your AI assistant" sectionId="contact" /></div>
  </div><ScrollReveals scope={`#${contentId}`} /></div>;
}

function ToolsSection() { return <ServiceTools id="rag-tools" name={ragService.name} eyebrow="Tech we use" title="Tech we use" introduction="We select models, retrieval frameworks, vector stores, and deployment choices around your use case and requirements."
  technologies={ragTools} presentation="platforms" balancedPlatforms showTechnologyLinks note={null} revealPrefix="rag-tool" headingReveal="rag-tools-heading" />; }
function ReferenceEmptyState({ text, href, label }: { text: string; href: string; label: string }) { return <div className={subStyles.referenceEmpty}><p>{text}</p><Link className={cloudStyles.primaryAction} href={href}>{label} <span aria-hidden="true">→</span></Link></div>; }
