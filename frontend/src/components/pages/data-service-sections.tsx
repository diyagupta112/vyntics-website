import Link from "next/link";
import { Container } from "@/components/ui/container";
import styles from "./data-service-sections.module.css";

type Item = { title: string; description: string };

export type DataServicePageSections = {
  serviceGroups: ReadonlyArray<{ title: string; introduction: string; items: readonly Item[] }>;
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

function Problems({ sections }: { sections: DataServicePageSections }) {
  return <section className={styles.problems} aria-labelledby="data-service-problems-title">
    <Container>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>When to act</p>
        <h2 id="data-service-problems-title">{sections.signs.title}</h2>
        <p>{sections.signs.introduction}</p>
      </header>
      <div className={styles.problemGrid}>
        {sections.signs.items.map((item, index) => <article key={item.title}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </article>)}
      </div>
    </Container>
  </section>;
}

function Services({ sections }: { sections: DataServicePageSections }) {
  return <section className={styles.services} aria-label="Service capabilities">
    <Container className={styles.serviceGroups}>
      {sections.serviceGroups.map((group, groupIndex) => <section key={group.title} aria-labelledby={`data-service-group-${groupIndex}`}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>Our services</p>
          <h2 id={`data-service-group-${groupIndex}`}>{group.title}</h2>
          <p>{group.introduction}</p>
        </header>
        <div className={styles.serviceGrid}>
          {group.items.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}
        </div>
      </section>)}
    </Container>
  </section>;
}

function Architecture({ sections }: { sections: DataServicePageSections }) {
  const architecture = sections.architecture;
  if (!architecture) return null;

  return <section className={styles.architecture} aria-labelledby="data-service-architecture-title">
    <Container>
      <header className={styles.heading}>
          <p className={styles.eyebrow}>Architecture</p>
        <h2 id="data-service-architecture-title">{architecture.title}</h2>
        <p>{architecture.introduction}</p>
      </header>
      <ol className={styles.architectureFlow} aria-label={architecture.title}>
        {architecture.stages.map((stage, index) => <li key={stage}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{stage}</strong>
          {index < architecture.stages.length - 1 ? <ArrowIcon /> : null}
        </li>)}
      </ol>
    </Container>
  </section>;
}

function Evidence({ sections }: { sections: DataServicePageSections }) {
  return <>
    <section className={styles.results} aria-labelledby="data-service-results-title">
      <Container>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>Results</p>
          <h2 id="data-service-results-title">Results.</h2>
          <p>{sections.results.introduction}</p>
        </header>
        <div className={styles.resultGrid}>
          {sections.results.items.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.description}</p></article>)}
        </div>
      </Container>
    </section>

    <section className={styles.proof} aria-labelledby="data-service-proof-title">
      <Container className={styles.proofLayout}>
        <div><p className={styles.eyebrow}>Proof</p><h2 id="data-service-proof-title">Case study.</h2></div>
        <div><p>We do not publish invented performance figures. Explore the case-study library for documented work, constraints, and outcomes from completed engagements.</p><Link href="/case-studies">Explore case studies <ArrowIcon /></Link></div>
      </Container>
    </section>

    <section className={styles.engagements} aria-labelledby="data-service-engagements-title">
      <Container>
        <header className={styles.heading}><p className={styles.eyebrow}>Ways to work together</p><h2 id="data-service-engagements-title">Engagement options.</h2></header>
        <ol className={styles.engagementGrid}>
          {sections.engagementOptions.map((item, index) => <li key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p></li>)}
        </ol>
      </Container>
    </section>

    <section className={styles.insights} aria-labelledby="data-service-insights-title">
      <Container>
        <header className={styles.heading}><p className={styles.eyebrow}>Resources</p><h2 id="data-service-insights-title">Related insights.</h2></header>
        <div className={styles.insightGrid}>
          {sections.insights.map(item => <Link href={item.href} key={item.title}><span>Data engineering</span><h3>{item.title}</h3><p>{item.description}</p><strong>Read article <ArrowIcon /></strong></Link>)}
        </div>
      </Container>
    </section>

    <section className={styles.faqs} aria-labelledby="data-service-faq-title">
      <Container className={styles.faqLayout}>
        <header><p className={styles.eyebrow}>Questions</p><h2 id="data-service-faq-title">FAQ.</h2></header>
        <div className={styles.faqList}>
          {sections.faqs.map((faq, index) => <details key={faq.question} open={index === 0} name="data-service-faq"><summary><h3>{faq.question}</h3><span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}
        </div>
      </Container>
    </section>

    <section className={styles.related} aria-labelledby="data-service-related-title">
      <Container>
        <header className={styles.heading}><p className={styles.eyebrow}>Continue exploring</p><h2 id="data-service-related-title">Related services.</h2></header>
        <div className={styles.relatedGrid}>
          {sections.relatedServices.map(item => <Link href={item.href} key={item.name}><h3>{item.name}</h3><p>{item.description}</p><span>Explore service <ArrowIcon /></span></Link>)}
        </div>
      </Container>
    </section>
  </>;
}

export function DataServiceSections({ variant, sections }: { variant: "problems" | "services" | "architecture" | "evidence"; sections: DataServicePageSections }) {
  if (variant === "problems") return <Problems sections={sections} />;
  if (variant === "services") return <Services sections={sections} />;
  if (variant === "architecture") return <Architecture sections={sections} />;
  return <Evidence sections={sections} />;
}
