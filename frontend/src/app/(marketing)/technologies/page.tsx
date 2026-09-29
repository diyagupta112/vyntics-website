import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import styles from "@/components/pages/listing-page.module.css";

export const metadata: Metadata = { title: "Technologies", description: "The AI, data, analytics, cloud, and backend technologies Vyntics uses to build production systems." };

const groups = [
  { title: "AI & machine learning", description: "Tools for grounded assistants, automation, retrieval, and model-powered products.", items: ["OpenAI", "Azure AI", "Pinecone", "RAG", "LLM evaluation"] },
  { title: "Data platforms", description: "Foundations for dependable ingestion, transformation, storage, and access.", items: ["Snowflake", "dbt", "PostgreSQL", "Python", "SQL"] },
  { title: "Analytics & BI", description: "Reporting and decision layers built around shared business definitions.", items: ["Power BI", "Tableau", "Amazon QuickSight", "KPI modeling", "Executive reporting"] },
  { title: "Cloud", description: "Services and infrastructure selected for workload, reliability, and cost.", items: ["AWS", "Microsoft Azure", "Google Cloud", "AWS Fargate", "Amazon S3"] },
  { title: "Platform & DevOps", description: "Repeatable delivery, portable environments, and observable production services.", items: ["Docker", "Kubernetes", "Terraform", "Grafana", "CI/CD"] },
  { title: "Backend & integration", description: "Application services and interfaces that connect data, AI, and business workflows.", items: ["FastAPI", "Node.js", "REST APIs", "PostgreSQL", "System integrations"] },
] as const;

export default function TechnologiesPage() {
  return (
    <>
      <section className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>Technologies</p>
          <h1>Modern tools, chosen with a reason.</h1>
          <p>We work across the AI, data, analytics, backend, and cloud stack. The architecture follows the problem—not a preferred vendor list.</p>
        </Container>
      </section>
      <section className={styles.section}>
        <Container>
          <div className={styles.sectionHeading}>
            <p className={styles.label}>Our stack</p>
            <h2>Technology that can be operated, understood, and owned.</h2>
          </div>
          <div className={styles.technologyGroups}>
            {groups.map((group) => (
              <article className={styles.technologyGroup} key={group.title}>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
                <ul className={styles.tags}>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
