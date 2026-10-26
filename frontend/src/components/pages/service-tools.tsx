import { Container } from "@/components/ui/container";
import Link from "next/link";
import styles from "./service-tools.module.css";
import editorial from "@/components/service-sub/editorial-tool-grid.module.css";
import sectionStyles from "@/app/(marketing)/services/data/page.module.css";
import { TechnologyLogo } from "@/components/service-sub/technology-logo";

type ToolDetail = { id?: string; name: string; displayName?: string; role?: string; description?: string; features?: readonly string[] };

const toolDescriptions: ReadonlyArray<readonly [readonly string[], string]> = [
  [["OpenAI", "Azure OpenAI", "Anthropic", "Anthropic Claude", "Google Gemini"], "Language models for generating, summarising, and extracting information within controlled workflows."],
  [["Azure AI"], "Managed AI services for connecting intelligent capabilities with enterprise applications."],
  [["Pinecone", "pgvector"], "Vector search for finding relevant information by meaning rather than exact keywords."],
  [["LangChain", "LangGraph"], "Orchestration for model calls, retrieval, tools, and multi-step AI workflows."],
  [["Python", "Node.js", "TypeScript"], "Application logic, integrations, and reusable services that connect the solution together."],
  [["FastAPI", "REST APIs", "GraphQL", "Webhooks"], "Structured interfaces for securely exchanging information between applications and services."],
  [["PostgreSQL", "SQL Server", "RDS"], "Relational storage for structured records, application data, and dependable queries."],
  [["SQL"], "Querying, transforming, and validating structured data for consistent downstream use."],
  [["Redis"], "Fast caching and short-lived state for responsive application workflows."],
  [["Azure AI Document Intelligence", "Azure Document Intelligence", "Amazon Textract", "Google Document AI"], "Extract text, fields, and document structure to support review and processing workflows."],
  [["n8n", "Make", "Zapier", "Power Automate", "Azure Logic Apps", "Temporal"], "Coordinate repeatable workflows, system actions, and automated hand-offs."],
  [["CrewAI"], "Coordinate specialized agents across a defined multi-step task."],
  [["Model Context Protocol (MCP)"], "Connect AI applications with approved tools and context sources through a shared interface."],
  [["Open-source LLMs"], "Self-hostable language models that can support greater control over deployment and data handling."],
  [["LlamaIndex"], "Connect language models to structured and unstructured knowledge sources for retrieval."],
  [["AWS", "Azure", "Microsoft Azure", "Google Cloud"], "Cloud services for hosting workloads with access controls, scaling, and operational monitoring."],
  [["Amazon S3", "AWS S3"], "Object storage for files, documents, and data used by processing and analytics pipelines."],
  [["Apache Airflow", "AWS Glue"], "Schedule and run data workflows with repeatable processing and visible execution status."],
  [["Apache Kafka"], "Streaming events between systems for continuous ingestion and near-real-time processing."],
  [["dbt"], "Versioned data transformations, tests, and documentation for maintainable analytical models."],
  [["Apache Spark"], "Distributed processing for large datasets and demanding transformation workloads."],
  [["Snowflake", "Amazon Redshift", "Google BigQuery", "BigQuery", "Microsoft Fabric"], "Analytical data foundations for governed storage, transformation, and reporting."],
  [["Airbyte", "Fivetran"], "Connect data sources and automate ingestion into the analytical environment."],
  [["Great Expectations", "Soda"], "Check data against defined quality rules before it reaches downstream consumers."],
  [["Monte Carlo", "OpenLineage"], "Visibility into data reliability, dependencies, and changes across pipelines."],
  [["Power BI", "Tableau", "Amazon QuickSight", "Looker", "Salesforce CRM Analytics", "HubSpot Reporting"], "Dashboards and reporting that turn shared metrics into actionable business views."],
  [["DAX", "Power Query", "Tableau Prep"], "Prepare reporting data and define calculations that support consistent analysis."],
  [["Tableau Cloud", "Tableau Server"], "Publish, share, and govern Tableau analytics for business teams."],
  [["SPICE", "Amazon Athena"], "Query and accelerate analytical data for responsive reporting workflows."],
  [["AWS IAM"], "Permissions and identity controls that limit access to the resources each role needs."],
  [["Excel", "PowerPoint", "SharePoint"], "Connect analysis, reporting, and shared documentation with familiar team workflows."],
  [["Salesforce", "HubSpot", "Microsoft Dynamics 365", "Dynamics 365", "Zoho CRM"], "Customer records, pipelines, and team workflows configured around the operating process."],
  [["Salesforce Flow", "HubSpot Workflows"], "Automate CRM updates, routing, and follow-up with clear workflow rules."],
  [["MuleSoft", "AWS Lambda"], "Integration logic that connects business systems and responds to application events."],
  [["Terraform"], "Versioned infrastructure definitions for repeatable provisioning and controlled changes."],
  [["Kubernetes", "Docker", "Helm"], "Package and deploy services consistently across development and production environments."],
  [["GitHub Actions", "GitLab CI", "Azure DevOps", "Argo CD"], "Automated checks and deployment pipelines for repeatable, traceable releases."],
  [["Cloudflare"], "Network-edge services supporting traffic delivery, protection, and application availability."],
  [["AWS Migration Hub", "Azure Migrate", "Google Cloud Migration Center"], "Assess existing workloads and plan their transition into the target cloud environment."],
  [["AWS Cost Explorer", "Azure Cost Management", "Google Cloud Billing", "FinOps", "Kubecost"], "Understand resource spend and identify opportunities to improve cloud cost efficiency."],
  [["Grafana", "Prometheus", "Datadog", "Azure Monitor", "Amazon CloudWatch", "Google Cloud Operations", "OpenTelemetry"], "Metrics, logs, and traces for understanding system health and investigating production issues."],
];

export function ServiceTools({ name, technologies, introduction, details, eyebrow = "Tools & platforms", title, id, headingId: customHeadingId, sectionName, presentation = "standard", balancedPlatforms = false, showDescriptions = true, showTechnologyLinks, sectionLink, note, revealPrefix, headingReveal }: {
  name: string;
  eyebrow?: string;
  title?: string;
  id?: string;
  headingId?: string;
  sectionName?: string;
  technologies: readonly string[];
  introduction?: string;
  details?: readonly ToolDetail[];
  presentation?: "standard" | "editorial" | "platforms";
  balancedPlatforms?: boolean;
  showDescriptions?: boolean;
  showTechnologyLinks?: boolean;
  sectionLink?: { href: string; label: string };
  note?: string | null;
  revealPrefix?: string;
  headingReveal?: string;
}) {
  const isEditorial = presentation !== "standard";
  const isPlatform = presentation === "platforms";
  const sectionId = id;
  const headingId = customHeadingId ?? (sectionId ? `${sectionId}-title` : "service-tools-title");
  const supportingNote = note === undefined ? "A considered stack, not a fixed checklist. Final choices depend on your workload and ownership needs." : note;
  const shouldShowTechnologyLink = showTechnologyLinks === true;
  const technologySectionLink = sectionLink ?? (shouldShowTechnologyLink ? { href: "/technologies", label: "View all technologies" } : undefined);
  return (
    <section id={sectionId} className={isEditorial ? sectionStyles.section : styles.section} aria-labelledby={headingId} data-cloud-section={sectionName}>
      <Container>
        <header className={isEditorial ? editorial.heading : styles.heading} data-reveal={headingReveal ?? (revealPrefix ? `${revealPrefix}-heading` : undefined)}>
          {eyebrow && <p className={styles.label}>{eyebrow}</p>}
          <h2 id={headingId}>{title ?? `The toolkit behind ${name}.`}</h2>
          <p>{introduction ?? `For ${name}, we select tools around your existing systems, security requirements, and team skills. Each layer has a clear purpose and a maintainable path to production.`}</p>
        </header>
        <div className={isEditorial ? `${editorial.grid}${isPlatform ? ` ${editorial.platformGrid}` : ""}` : styles.grid}>
          {technologies.map((tool, index) => {
            const detail = details?.find((item) => item.name === tool);
            const description = detail?.description ?? toolDescriptions.find(([names]) => names.includes(tool))?.[1];
            const copy = <><h3>{detail?.displayName ?? tool}</h3>{detail?.role && <span>{detail.role}</span>}{showDescriptions && <p>{description ?? `Supports the ${name} workflow, with integration and configuration matched to your operating environment.`}</p>}{detail?.features && <ul className={editorial.featureList}>{detail.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>}</>;
            return (
              <article id={detail?.id} className={isEditorial ? `${editorial.card}${isPlatform ? ` ${editorial.platformCard}${balancedPlatforms ? ` ${editorial.balancedPlatformCard}` : ""}` : ""}` : undefined} key={tool} data-reveal={revealPrefix ? `${revealPrefix}-${index}` : undefined} data-reveal-delay={revealPrefix ? String(Math.min(index * 90, 450)) : undefined}>
                {isPlatform ? <><TechnologyLogo name={tool} /><div className={`${editorial.platformCopy}${balancedPlatforms ? ` ${editorial.balancedPlatformCopy}` : ""}`}>{copy}</div></> : copy}
              </article>
            );
          })}
        </div>
        {technologySectionLink && <Link className={editorial.sectionLink} href={technologySectionLink.href}>{technologySectionLink.label} <span aria-hidden="true">→</span></Link>}
        {supportingNote && <p className={isEditorial ? editorial.note : styles.note}>{supportingNote}</p>}
      </Container>
    </section>
  );
}
