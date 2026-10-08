import type { Metadata } from "next";
import type { CSSProperties } from "react";
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
  { label: "AI & intelligence", image: "/images/technology-ai-robot.png", description: "AI systems designed for practical business applications, intelligent automation, and grounded responses.", tools: ["OpenAI", "Azure OpenAI", "Anthropic", "LangChain", "Google Gemini", "Pinecone", "LangGraph", "PGVector", "RAG", "LLM Assessment"] },
  { label: "Data engineering", image: "/images/technology-data-finance-dashboard.png", description: "Ingestion, transformation, storage, modeling, and controlled access are all reliable.", tools: ["Snowflake", "dbt", "PostgreSQL", "Python", "SQL", "Apache Spark", "Apache Airflow", "Kafka", "AWS Glue", "Amazon S3"] },
  { label: "Analytics & BI", image: "/images/technology-analytics-connected.png", description: "Data is transformed into understandable decisions through shared metrics and reporting layers.", tools: ["Power BI", "Tableau", "QuickSight", "Looker", "Grafana", "DAX", "Power Query", "Semantic models", "KPI modeling"] },
  { label: "Cloud & platform", image: "/images/technology-cloud-network.png", description: "Infrastructure that is observable, secure, and built on dependability and affordability.", tools: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "AWS Fargate", "GitHub Actions", "CI/CD", "Observability"] },
  { label: "CRM", image: "/images/technology-crm-workspace.png", description: "Automation throughout the customer lifetime, sales processes, and linked customer data.", tools: ["Salesforce", "HubSpot", "Dynamics 365", "Zoho CRM", "Salesforce Flow", "HubSpot Workflows", "Power Automate", "n8n", "REST APIs", "MuleSoft"] },
] as const;

const toolGroups = [
  { title: "Build", description: "Create dependable applications, APIs, and connected services.", tools: ["Python", "Node.js", "FastAPI", "REST APIs", "PostgreSQL"] },
  { title: "Transform", description: "Turn raw data into organised, accessible foundations.", tools: ["Snowflake", "dbt", "SQL", "Pinecone", "Amazon S3"] },
  { title: "Understand", description: "Bring metrics, reporting, and operational insights into focus.", tools: ["Power BI", "Tableau", "QuickSight", "Grafana"] },
  { title: "Operate", description: "Deploy, monitor, and maintain systems with confidence.", tools: ["Docker", "Kubernetes", "Terraform", "CI/CD", "AWS Fargate"] },
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
            <p className={styles.eyebrow}>Vyntics&apos;s technology</p>
            <h1><span>Production-Ready AI,</span><span>Data, and Cloud Technology</span></h1>
            <p>We employ tried-and-true AI, data engineering, analytics, and cloud technologies to create dependable systems that address actual business issues rather than just showy demonstrations.</p>
            <p>From cloud infrastructure and analytics to clever AI solutions and data platforms, we select the best technology depending on business objectives, technical environment, scalability requirements, and long-term ownership.</p>
          </div>
        </Container>
      </section>

      <section className={styles.landscape} aria-labelledby="technology-landscape">
        <Container>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Our technological environment</p>
            <h2 id="technology-landscape">One interconnected landscape of engineering.</h2>
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
            <p className={styles.eyebrow}>The instruments we employ</p>
            <h2 id="tool-index-title">A useful toolbox for the whole lifespan of delivery.</h2>
            <p>These aren&apos;t a set vendor checklist; rather, they are representative tools. What the system truly requires is what we use.</p>
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
            <div><p className={styles.eyebrow}>Using technology in customer service</p><h2 id="client-work-title">Stacks put together according to actual operational requirements.</h2></div>
          </div>
          <ClientWorkCarousel projects={projects} />
        </Container>
      </section>

    </>
  );
}
