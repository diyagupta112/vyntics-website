import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { FeaturedWork } from "@/components/sections/home/featured-work";
import { Container } from "@/components/ui/container";
import { getCaseStudies } from "@/lib/case-studies";
import { DataServiceReveal } from "./data-service-reveal";
import styles from "./data-service-sections.module.css";

type Item = { title: string; description: string };
type ServiceKind = "pipelines" | "warehouse" | "quality";

export type DataServicePageSections = {
  kind: ServiceKind;
  serviceGroups: ReadonlyArray<{ title: string; introduction: string; items: readonly Item[] }>;
  spotlight?: { title: string; introduction: string; items: readonly Item[] };
  process: ReadonlyArray<{ title: string; description: string }>;
  toolsHeading: string;
  signs: { title: string; introduction: string; items: readonly Item[] };
  architecture?: { title: string; introduction: string; stages: readonly string[] };
  results: { introduction: string; items: readonly Item[] };
  engagementOptions: readonly Item[];
  insights: ReadonlyArray<{ title: string; description: string; href: string }>;
  faqs: ReadonlyArray<{ question: string; answer: string }>;
  relatedServices: ReadonlyArray<{ name: string; description: string; href: string }>;
};

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" /></svg>;
}

const pipelineProblemImages = [
  { src: "/images/pipeline-problem-manual-exports.jpg", alt: "Spreadsheet work open on a laptop beside physical files" },
  { src: "/images/pipeline-problem-broken-reports.jpg", alt: "Printed analytical charts being reviewed with a magnifying glass" },
  { src: "/images/pipeline-problem-separate-tools.jpg", alt: "Team comparing reports across laptops, tablets, and printed documents" },
  { src: "/images/pipeline-problem-slow-data.jpg", alt: "Workspace with a large digital clock displayed on a laptop" },
] as const;

function NotchedProblemCard({ item, index }: { item: Item; index: number }) {
  const titleId = `pipeline-problem-${index}`;
  const image = pipelineProblemImages[index];
  return <article className={styles.notchedCard} tabIndex={0} aria-labelledby={titleId}>
    <div className={styles.notchedMedia}>
      <div className={styles.notchedVisual}>
        <Image className={styles.problemImage} src={image.src} alt={image.alt} fill sizes="(max-width: 680px) 100vw, (max-width: 960px) 50vw, 25vw" />
      </div>
      <span className={styles.notchCore} aria-hidden="true" />
      <span className={`${styles.notchCurve} ${styles.notchCurveTop}`} aria-hidden="true" />
      <span className={`${styles.notchCurve} ${styles.notchCurveLeft}`} aria-hidden="true" />
      <span className={styles.notchBadge} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M7 7h10v10" /></svg></span>
    </div>
    <h3 id={titleId}>{item.title}</h3>
    <p>{item.description}</p>
  </article>;
}

const visualLabels: Record<ServiceKind, string> = {
  pipelines: "Business systems connected through validated ingestion and transformation to analytics destinations",
  warehouse: "Multiple data sources feeding governed warehouse layers and downstream dashboards and AI",
  quality: "Data records passing through validation, ownership, lineage, and monitoring controls",
};

export function DataServiceHeroVisual({ kind }: { kind: ServiceKind }) {
  return <figure className={`${styles.heroVisual} ${styles[kind]}`} role="img" aria-label={visualLabels[kind]}>
    {kind === "pipelines" ? <>
      <div className={styles.sourceColumn}><span>CRM</span><span>ERP</span><span>API</span></div>
      <svg viewBox="0 0 280 170" aria-hidden="true"><path d="M35 35C100 35 92 85 142 85S188 35 245 35M35 85h210M35 135c65 0 57-50 107-50s46 50 103 50" /><circle cx="142" cy="85" r="18" /></svg>
      <div className={styles.destinationColumn}><span>Transform</span><strong>Trusted data</strong></div>
    </> : kind === "warehouse" ? <>
      <div className={styles.warehouseSources}><span>Apps</span><span>Files</span><span>Events</span></div>
      <div className={styles.warehouseLayers}><span>Raw</span><span>Modelled</span><strong>Governed</strong></div>
      <div className={styles.warehouseOutputs}><span>BI</span><span>AI</span></div>
    </> : <>
      <div className={styles.recordTable} aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>
      <div className={styles.qualityGate}><span>Validate</span><strong>✓</strong></div>
      <div className={styles.governanceRail}><span>Owner</span><span>Lineage</span><span>Access</span></div>
    </>}
  </figure>;
}

function Problems({ sections }: { sections: DataServicePageSections }) {
  return <section className={styles.problems} data-kind={sections.kind} aria-labelledby="data-service-problems-title">
    <Container>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>When to act</p>
        <h2 id="data-service-problems-title">{sections.signs.title}</h2>
        <p>{sections.signs.introduction}</p>
      </header>
      <DataServiceReveal className={`${styles.problemGrid} ${sections.kind === "pipelines" ? styles.notchedGrid : ""} ${styles.revealGroup}`}>
        {sections.signs.items.map((item, index) => sections.kind === "pipelines"
          ? <NotchedProblemCard item={item} index={index} key={item.title} />
          : <article key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}
      </DataServiceReveal>
    </Container>
  </section>;
}

function Services({ sections }: { sections: DataServicePageSections }) {
  return <section className={styles.services} data-kind={sections.kind} aria-label="Service capabilities">
    <Container className={styles.serviceGroups}>
      {sections.serviceGroups.map((group, groupIndex) => <section key={group.title} aria-labelledby={`data-service-group-${groupIndex}`}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>Our services</p>
          <h2 id={`data-service-group-${groupIndex}`}>{group.title}</h2>
          <p>{group.introduction}</p>
        </header>
        <DataServiceReveal className={`${styles.serviceGrid} ${styles.revealGroup}`}>
          {group.items.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}
        </DataServiceReveal>
      </section>)}
    </Container>
  </section>;
}

function Spotlight({ sections }: { sections: DataServicePageSections }) {
  if (!sections.spotlight) return null;
  return <section className={styles.spotlight} data-kind={sections.kind} aria-labelledby="data-service-spotlight-title">
    <Container className={styles.spotlightLayout}>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>Early warning</p>
        <h2 id="data-service-spotlight-title">{sections.spotlight.title}</h2>
        <p>{sections.spotlight.introduction}</p>
      </header>
      <DataServiceReveal className={`${styles.monitorPanel} ${styles.revealGroup}`}>
        {sections.spotlight.items.map((item, index) => <article key={item.title}>
          <span aria-hidden="true"><i />{String(index + 1).padStart(2, "0")}</span>
          <div><h3>{item.title}</h3><p>{item.description}</p></div>
        </article>)}
      </DataServiceReveal>
    </Container>
  </section>;
}

function Architecture({ sections }: { sections: DataServicePageSections }) {
  const architecture = sections.architecture;
  if (!architecture) return null;
  return <section className={styles.architecture} data-kind={sections.kind} aria-labelledby="data-service-architecture-title">
    <Container>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>Architecture</p>
        <h2 id="data-service-architecture-title">{architecture.title}</h2>
        <p>{architecture.introduction}</p>
      </header>
      <DataServiceReveal className={`${styles.architectureReveal} ${styles.revealGroup}`}>
        <ol className={styles.architectureFlow} aria-label={architecture.title}>
          {architecture.stages.map((stage, index) => <li key={stage}>
            <span>{String(index + 1).padStart(2, "0")}</span><strong>{stage}</strong>
            {index < architecture.stages.length - 1 ? <ArrowIcon /> : null}
          </li>)}
        </ol>
      </DataServiceReveal>
    </Container>
  </section>;
}

async function DataEngineeringCaseStudy() {
  let studies: Awaited<ReturnType<typeof getCaseStudies>> | null = null;
  try {
    studies = await getCaseStudies("data_engineering");
  } catch { /* Render the explicit unavailable state below. */ }
  if (!studies) return <FeaturedWork studies={[]} heading="Data engineering work in production" description="Verified projects connected to data engineering, selected from Vyntics' published case studies." unavailable />;
  const featured = studies.filter((study) => study.featured);
  return <FeaturedWork studies={(featured.length > 0 ? featured : studies).slice(0, 3)} heading="Data engineering work in production" description="Verified projects connected to data engineering, selected from Vyntics' published case studies." />;
}

function Evidence({ sections }: { sections: DataServicePageSections }) {
  return <>
    <section className={styles.results} aria-labelledby="data-service-results-title">
      <Container>
        <header className={styles.heading}><p className={styles.eyebrow}>Results</p><h2 id="data-service-results-title">Results we measure.</h2><p>{sections.results.introduction}</p></header>
        <DataServiceReveal className={`${styles.resultGrid} ${styles.revealGroup}`}>{sections.results.items.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.description}</p></article>)}</DataServiceReveal>
      </Container>
    </section>
    <Suspense fallback={<FeaturedWork loading heading="Data engineering work in production" />}><DataEngineeringCaseStudy /></Suspense>
    <section className={styles.engagements} aria-labelledby="data-service-engagements-title">
      <Container>
        <header className={styles.heading}><p className={styles.eyebrow}>Ways to work together</p><h2 id="data-service-engagements-title">Engagement options.</h2></header>
        <DataServiceReveal className={`${styles.revealGroup} ${styles.engagementReveal}`}><ol className={styles.engagementGrid}>{sections.engagementOptions.map((item, index) => <li key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p></li>)}</ol></DataServiceReveal>
      </Container>
    </section>
    <section className={styles.insights} aria-labelledby="data-service-insights-title">
      <Container>
        <header className={styles.heading}><p className={styles.eyebrow}>Resources</p><h2 id="data-service-insights-title">Related insights.</h2></header>
        <DataServiceReveal className={`${styles.insightGrid} ${styles.revealGroup}`}>{sections.insights.map(item => <Link href={item.href} key={item.title}><span>Data engineering</span><h3>{item.title}</h3><p>{item.description}</p><strong>Read article <ArrowIcon /></strong></Link>)}</DataServiceReveal>
      </Container>
    </section>
    <section className={styles.faqs} aria-labelledby="data-service-faq-title">
      <Container className={styles.faqLayout}>
        <header><p className={styles.eyebrow}>Questions</p><h2 id="data-service-faq-title">FAQ.</h2></header>
        <div className={styles.faqList}>{sections.faqs.map((faq, index) => <details key={faq.question} open={index === 0} name="data-service-faq"><summary><h3>{faq.question}</h3><span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div>
      </Container>
    </section>
  </>;
}

function Related({ sections }: { sections: DataServicePageSections }) {
  return <section className={styles.related} aria-labelledby="data-service-related-title">
    <Container>
      <header className={styles.heading}><p className={styles.eyebrow}>Continue exploring</p><h2 id="data-service-related-title">Related services.</h2></header>
      <DataServiceReveal className={`${styles.relatedGrid} ${styles.revealGroup}`}>{sections.relatedServices.map(item => <Link href={item.href} key={item.href}><h3>{item.name}</h3><p>{item.description}</p><span>Explore service <ArrowIcon /></span></Link>)}</DataServiceReveal>
    </Container>
  </section>;
}

export function DataServiceSections({ variant, sections }: { variant: "problems" | "services" | "spotlight" | "architecture" | "evidence" | "related"; sections: DataServicePageSections }) {
  if (variant === "problems") return <Problems sections={sections} />;
  if (variant === "services") return <Services sections={sections} />;
  if (variant === "spotlight") return <Spotlight sections={sections} />;
  if (variant === "architecture") return <Architecture sections={sections} />;
  if (variant === "related") return <Related sections={sections} />;
  return <Evidence sections={sections} />;
}
