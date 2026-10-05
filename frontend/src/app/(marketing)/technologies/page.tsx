import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { projects } from "@/content/projects";
import { ProcessStack } from "./process-stack";
import { ClientWorkCarousel } from "./client-work-carousel";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Technologies",
  description: "The AI, data, analytics, cloud, and backend technologies Vyntics uses to build dependable production systems.",
};

const technologyGroups = [
  { label: "AI & intelligence", image: "/images/technology-ai.png", description: "Grounded assistants, document intelligence, evaluation, and controlled automation.", tools: ["OpenAI", "Azure OpenAI", "Anthropic", "Google Gemini", "LangChain", "LangGraph", "Pinecone", "pgvector", "RAG", "LLM evaluation"] },
  { label: "Data engineering", image: "/images/technology-data.png", description: "Reliable ingestion, transformation, storage, modeling, and governed access.", tools: ["Snowflake", "dbt", "PostgreSQL", "Python", "SQL", "Apache Spark", "Apache Airflow", "Kafka", "AWS Glue", "Amazon S3"] },
  { label: "Analytics & BI", image: "/images/technology-analytics.png", description: "Shared metrics and reporting layers that turn data into clear decisions.", tools: ["Power BI", "Tableau", "QuickSight", "Looker", "Grafana", "DAX", "Power Query", "Semantic models", "KPI modeling"] },
  { label: "Cloud & platform", image: "/images/technology-cloud.png", description: "Secure, observable infrastructure designed around reliability and sensible cost.", tools: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "AWS Fargate", "GitHub Actions", "CI/CD", "Observability"] },
] as const;

const toolGroups = [
  { title: "Build", description: "Create dependable applications, APIs, and connected services.", tools: ["Python", "Node.js", "FastAPI", "REST APIs", "PostgreSQL"] },
  { title: "Transform", description: "Turn raw data into organised, accessible foundations.", tools: ["Snowflake", "dbt", "SQL", "Pinecone", "Amazon S3"] },
  { title: "Understand", description: "Bring metrics, reporting, and operational insights into focus.", tools: ["Power BI", "Tableau", "QuickSight", "Grafana"] },
  { title: "Operate", description: "Deploy, monitor, and maintain systems with confidence.", tools: ["Docker", "Kubernetes", "Terraform", "CI/CD", "AWS Fargate"] },
] as const;

const process = [
  {
    title: "Start with the outcome",
    description: "We define what the system must improve, who will use it, and how success will be measured before selecting a platform.",
    points: ["Business goal and success metrics", "User workflows and decision points", "Scope, constraints, and priorities"],
  },
  {
    title: "Fit the environment",
    description: "The stack is shaped around your data, team skills, security constraints, and systems already in production.",
    points: ["Current systems and data sources", "Security and compliance requirements", "Team skills and operating model"],
  },
  {
    title: "Prove the difficult part",
    description: "We test the highest-risk assumption early, using a focused prototype before committing to a larger build.",
    points: ["Technical feasibility prototype", "Performance and quality checks", "Early feedback from real users"],
  },
  {
    title: "Build for ownership",
    description: "Clear interfaces, monitoring, documentation, and maintainable code keep the system useful after launch.",
    points: ["Observable production deployment", "Documentation and knowledge transfer", "Maintainable paths for future change"],
  },
] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export default function TechnologiesPage() {
  return (
    <>
      <section className={styles.hero}>
        <Container className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Technology at Vyntics</p>
            <h1>A modern stack, selected for the work.</h1>
            <p>We use proven AI, data, analytics, and cloud technologies to build systems that are useful in production-not just impressive in a demo.</p>
            <p>Every choice is made around the outcome, the operating environment, and the people who will own it next.</p>
          </div>
          <div className={styles.heroMedia} aria-label="Technology image placeholder" />
        </Container>
      </section>

      <section className={styles.landscape} aria-labelledby="technology-landscape">
        <Container>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Our technology ecosystem</p>
            <h2 id="technology-landscape">One connected engineering landscape.</h2>
            <p>From raw information to a working application, we bring the layers together as one maintainable system.</p>
          </div>
          <div className={styles.landscapeGrid}>
            {technologyGroups.map((group) => (
              <article
                key={group.label}
                className={styles.landscapeCard}
                style={{ "--card-image": `url("${group.image}")` } as CSSProperties}
                tabIndex={0}
              >
                <div className={styles.cardHeading}>
                  <h3>{group.label}</h3>
                </div>
                <div className={styles.cardDetails}>
                  <p>{group.description}</p>
                  <ul>{group.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.toolIndex} aria-labelledby="tool-index-title">
        <Container className={styles.toolIndexGrid}>
          <div className={styles.stickyHeading}>
            <p className={styles.eyebrow}>Tools we use</p>
            <h2 id="tool-index-title">A practical toolkit across the delivery lifecycle.</h2>
            <p>These are representative tools, not a fixed vendor checklist. We use what the system actually needs.</p>
          </div>
          <div className={styles.toolRows}>
            {toolGroups.map((group, index) => (
              <article key={group.title}>
                <div className={styles.toolCardHeading}>
                  <span aria-hidden="true">0{index + 1}</span>
                  <h3>{group.title}</h3>
                </div>
                <p className={styles.toolDescription}>{group.description}</p>
                <ul>{group.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <ProcessStack steps={process} />

      <section className={styles.clientWork} aria-labelledby="client-work-title">
        <Container>
          <div className={styles.clientHeading}>
            <div><p className={styles.eyebrow}>Technology in client work</p><h2 id="client-work-title">Stacks assembled around real operating needs.</h2></div>
            <Link href="/case-studies">View all case studies <ArrowIcon /></Link>
          </div>
          <ClientWorkCarousel projects={projects} />
        </Container>
      </section>

    </>
  );
}
