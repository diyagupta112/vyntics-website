import Link from "next/link";
import { Container } from "@/components/ui/container";
import styles from "./data-service-sections.module.css";

type Item = { title: string; description: string };
type ContentGroup = { title: string; introduction: string; items: readonly Item[] };

export type AiServicePageSections = {
  signs: { title: string; introduction: string; items: readonly Item[] };
  beforeFlow: readonly ContentGroup[];
  flow: { title: string; introduction: string; stages: readonly string[] };
  afterFlow: readonly ContentGroup[];
  process: ReadonlyArray<{ title: string; description: string }>;
  toolsHeading: string;
  results: { introduction: string; items: readonly Item[] };
  engagementOptions: readonly Item[];
  insights: ReadonlyArray<{ title: string; description: string; href: string }>;
  faqs: ReadonlyArray<{ question: string; answer: string }>;
  relatedServices: ReadonlyArray<{ name: string; description: string; href: string }>;
};

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" /></svg>;
}

function ContentGroups({ groups }: { groups: readonly ContentGroup[] }) {
  if (!groups.length) return null;
  return <section className={styles.services} aria-label="AI service capabilities">
    <Container className={styles.serviceGroups}>
      {groups.map((group, groupIndex) => <section key={group.title} aria-labelledby={`ai-service-group-${groupIndex}-${group.title.replace(/\W+/g, "-").toLowerCase()}`}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>Capabilities</p>
          <h2 id={`ai-service-group-${groupIndex}-${group.title.replace(/\W+/g, "-").toLowerCase()}`}>{group.title}</h2>
          <p>{group.introduction}</p>
        </header>
        <div className={styles.serviceGrid}>
          {group.items.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}
        </div>
      </section>)}
    </Container>
  </section>;
}

function Problems({ sections }: { sections: AiServicePageSections }) {
  return <section className={styles.problems} aria-labelledby="ai-service-problems-title">
    <Container>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>When to act</p>
        <h2 id="ai-service-problems-title">{sections.signs.title}</h2>
        <p>{sections.signs.introduction}</p>
      </header>
      <div className={styles.problemGrid}>
        {sections.signs.items.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}
      </div>
    </Container>
  </section>;
}

function Capabilities({ sections }: { sections: AiServicePageSections }) {
  return <>
    <ContentGroups groups={sections.beforeFlow} />
    <section className={styles.architecture} aria-labelledby="ai-service-flow-title">
      <Container>
        <header className={styles.heading}><p className={styles.eyebrow}>How it works</p><h2 id="ai-service-flow-title">{sections.flow.title}</h2><p>{sections.flow.introduction}</p></header>
        <ol className={styles.architectureFlow} aria-label={sections.flow.title}>
          {sections.flow.stages.map((stage, index) => <li key={stage}><span>{String(index + 1).padStart(2, "0")}</span><strong>{stage}</strong>{index < sections.flow.stages.length - 1 ? <ArrowIcon /> : null}</li>)}
        </ol>
      </Container>
    </section>
    <ContentGroups groups={sections.afterFlow} />
  </>;
}

function Evidence({ sections }: { sections: AiServicePageSections }) {
  return <>
    <section className={styles.results} aria-labelledby="ai-service-results-title">
      <Container>
        <header className={styles.heading}><p className={styles.eyebrow}>Outcomes</p><h2 id="ai-service-results-title">Results</h2><p>{sections.results.introduction}</p></header>
        <div className={styles.resultGrid}>{sections.results.items.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>
      </Container>
    </section>

    <section className={styles.proof} aria-labelledby="ai-service-proof-title">
      <Container className={styles.proofLayout}>
        <div><p className={styles.eyebrow}>Proof</p><h2 id="ai-service-proof-title">Case study</h2></div>
        <div><p>We do not invent performance figures. Explore documented work for the constraints, delivery approach, and measurable outcomes behind completed engagements.</p><Link href="/case-studies">Explore case studies <ArrowIcon /></Link></div>
      </Container>
    </section>

    <section className={styles.engagements} aria-labelledby="ai-service-engagements-title">
      <Container>
        <header className={styles.heading}><p className={styles.eyebrow}>Ways to work together</p><h2 id="ai-service-engagements-title">Engagement options</h2></header>
        <ol className={styles.engagementGrid}>{sections.engagementOptions.map((item, index) => <li key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p></li>)}</ol>
      </Container>
    </section>

    <section className={styles.insights} aria-labelledby="ai-service-insights-title">
      <Container>
        <header className={styles.heading}><p className={styles.eyebrow}>Resources</p><h2 id="ai-service-insights-title">Related insights</h2></header>
        <div className={styles.insightGrid}>{sections.insights.map(item => <Link href={item.href} key={item.title}><span>AI solutions</span><h3>{item.title}</h3><p>{item.description}</p><strong>Explore insights <ArrowIcon /></strong></Link>)}</div>
      </Container>
    </section>

    <section className={styles.faqs} aria-labelledby="ai-service-faq-title">
      <Container className={styles.faqLayout}>
        <header><p className={styles.eyebrow}>Questions</p><h2 id="ai-service-faq-title">FAQ</h2></header>
        <div className={styles.faqList}>{sections.faqs.map((faq, index) => <details key={faq.question} open={index === 0} name="ai-service-faq"><summary><h3>{faq.question}</h3><span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div>
      </Container>
    </section>

    <section className={styles.related} aria-labelledby="ai-service-related-title">
      <Container>
        <header className={styles.heading}><p className={styles.eyebrow}>Continue exploring</p><h2 id="ai-service-related-title">Related services</h2></header>
        <div className={styles.relatedGrid}>{sections.relatedServices.map(item => <Link href={item.href} key={item.name}><h3>{item.name}</h3><p>{item.description}</p><span>Explore service <ArrowIcon /></span></Link>)}</div>
      </Container>
    </section>
  </>;
}

export function AiServiceSections({ variant, sections }: { variant: "problems" | "capabilities" | "evidence"; sections: AiServicePageSections }) {
  if (variant === "problems") return <Problems sections={sections} />;
  if (variant === "capabilities") return <Capabilities sections={sections} />;
  return <Evidence sections={sections} />;
}
