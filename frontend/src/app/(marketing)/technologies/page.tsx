import { technologyToolGroups } from "@/content/technology-tools";
import { ToolsPlatforms } from "./tools-platforms";
import type { Metadata } from "next";
import { Suspense, type CSSProperties } from "react";
import { FeaturedWork } from "@/components/sections/home/featured-work";
import { Container } from "@/components/ui/container";
import { ProcessStack } from "./process-stack";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Technologies",
  description: "The AI, data, analytics, cloud, and backend technologies Vyntics uses to build dependable production systems.",
};

const technologyGroups = [
  { label: "AI Solutions", image: "/images/technology-ai.png", description: "AI systems designed for practical business applications, intelligent automation, and grounded responses.", tools: ["OpenAI", "Azure OpenAI", "Anthropic", "LangChain", "Google Gemini", "Pinecone", "LangGraph", "PGVector", "RAG", "LLM Assessment"] },
  { label: "Data Engineering", image: "/images/technology-Data-Engineering.jpg", description: "Ingestion, transformation, storage, modeling, and controlled access are all reliable.", tools: ["Snowflake", "dbt", "PostgreSQL", "Python", "SQL", "Apache Spark", "Apache Airflow", "Kafka", "AWS Glue", "Amazon S3"] },
  { label: "Cloud Foundations", image: "/images/technology-Cloud%20Operations.png", description: "Infrastructure that is observable, secure, and built on dependability and affordability.", tools: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "AWS Fargate", "GitHub Actions", "CI/CD", "Observability"] },
  { label: "CRM & Revenue Ops", image: "/images/technology-CRM.jpg", description: "Automation throughout the customer lifetime, sales processes, and linked customer data.", tools: ["Salesforce", "HubSpot", "Dynamics 365", "Zoho CRM", "Salesforce Flow", "HubSpot Workflows", "Power Automate", "n8n", "REST APIs", "MuleSoft"] },
  { label: "Analytics & BI", image: "/images/technology-Analytics%26BI.jpg", description: "Data is transformed into understandable decisions through shared metrics and reporting layers.", tools: ["Power BI", "Tableau", "QuickSight", "Looker", "Grafana", "DAX", "Power Query", "Semantic models", "KPI modeling"] },
] as const;

const process = [
  {
    title: "Consider the result first.",
    description: "Before choosing a platform, we specify what has to be improved, who will use it, and how success will be evaluated.",
    points: ["Goals for the business and success metrics", "User decision-making and workflows", "Priorities, scope, and limitations"],
  },
  {
    title: "Adapt to the surroundings",
    description: "The stack is built around your data, team capabilities, security limitations, and operational systems.",
    points: ["Current data sources and systems", "requirements for security and compliance", "Operating model and team skills"],
  },
  {
    title: "Show the challenging aspect",
    description: "Before committing to a larger development, we employ a targeted prototype to evaluate the assumption that carries the biggest risk.",
    points: ["A prototype for technical viability", "Checks for performance and quality", "Initial comments from actual users"],
  },
  {
    title: "Construct for your own use",
    description: "After the system is launched, its usefulness is maintained by clear interfaces, documentation, monitoring, and maintainable code.",
    points: ["Production deployment that is observable", "Documentation and transfer of knowledge", "Paths for future change that are sustainable"],
  },
] as const;

export default function TechnologiesPage() {
  return (
    <>
      <section className={styles.hero}>
        <Container className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Vyntics Technology</p>
            <h1><span>Production-Ready AI,</span><span>Data, And Cloud Technology</span></h1>
            <p>We employ tried-and-true AI, data engineering, analytics, and cloud technologies to create dependable systems that address actual business issues rather than just showy demonstrations.</p>
            <p>From cloud infrastructure and analytics to clever AI solutions and data platforms, we select the best technology depending on business objectives, technical environment, scalability requirements, and long-term ownership.</p>
          </div>
        </Container>
      </section>

      <section className={styles.landscape} aria-labelledby="technology-landscape">
        <Container>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Our technological environment</p>
            <h2 id="technology-landscape">One Interconnected Landscape Of Engineering</h2>
            <p>We integrate the layers into a single, manageable system, from raw data to a functional application.</p>
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
            <p className={styles.eyebrow}>TECHNOLOGY STACK</p>
            <h2 id="tool-index-title">Tools &amp; Platforms</h2>
            <p>The technologies and platforms we use to design, build, integrate, and scale solutions across data, AI, cloud, CRM, and analytics.</p>
          </div>
          <ToolsPlatforms groups={technologyToolGroups} />
        </Container>
      </section>

      <ProcessStack steps={process} />

      <Suspense fallback={<FeaturedWork loading heading="Give Your Business An Edge With AI" />}><FeaturedWork heading="Give Your Business An Edge With AI" /></Suspense>

    </>
  );
}
