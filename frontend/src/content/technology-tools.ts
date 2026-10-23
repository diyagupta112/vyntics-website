import { dataPlatforms, aiPlatforms, cloudPlatforms } from "./service-platforms";
import { platformServices } from "./platform-services";
import { legacyServiceRoutes } from "./service-route-map";
import { cloudSubPages } from "./cloud-sub-services/pages";
import { crmContent } from "@/app/(marketing)/services/crm-revenue-ops/crm-revenue-ops-content";
import { analyticsContent } from "@/app/(marketing)/services/analytics-bi/analytics-bi-content";
import { pipelineTools } from "@/app/(marketing)/services/data-engineering/data-pipelines-integration/content";
import { warehousePlatforms } from "@/app/(marketing)/services/data-engineering/data-warehousing-lakehouse/content";
import { qualityTools } from "@/app/(marketing)/services/data-engineering/data-quality-governance/content";
import { ragTools, ragSections } from "@/app/(marketing)/services/ai-solutions/rag-knowledge-assistants/content";
import { agentTools, agentSections } from "@/app/(marketing)/services/ai-solutions/ai-agents/content";
import { intelligentAutomationTools } from "@/app/(marketing)/services/ai-solutions/intelligent-automation/content";
import { crmPlatforms } from "@/app/(marketing)/services/crm-revenue-ops/crm-implementation-integration/content";
import { salesTools } from "@/app/(marketing)/services/crm-revenue-ops/sales-automation-revenue-analytics/content";
import { biToolComparison, biConsultingSections } from "@/app/(marketing)/services/analytics-bi/bi-consulting/content";
import { getTechnologyLogoFiles } from "./technology-logos";
import { cloudServiceIntroductions } from "@/app/(marketing)/services/cloud/cloud-foundations-content";

export const technologyCategoryOrder = ["AI", "Data", "Cloud", "CRM", "Analytics"] as const;
export type TechnologyCategory = typeof technologyCategoryOrder[number];
type Platform = { name: string; description?: string; role?: string };
type ToolSource = {
  category: TechnologyCategory;
  route: string;
  section: string;
  sourceFile: string;
  names: readonly string[];
  text?: string;
  evidence?: string;
};
const serviceFile = (path: string) => `src/app/(marketing)/services/${path}`;
const names = (items: readonly Platform[]) => items.map(item => item.name);
const platformText = (items: readonly Platform[]) => items.map(item => `${item.role ?? ""} ${item.description ?? ""}`).join(" ");
const main = (category: TechnologyCategory, route: string, sourceFile: string, items: readonly Platform[]): ToolSource => ({
  category, route: `/services/${route}`, sourceFile, section: "Platforms", names: names(items), text: platformText(items),
});
const sub = (category: TechnologyCategory, path: string, section: string, tools: readonly string[], text?: string): ToolSource => ({
  category, route: `/services/${path}`, section, sourceFile: serviceFile(`${path}/content.ts`), names: tools, text,
});

// Sources are the actual inputs to ServiceTools, ServicePillarPlatforms, and the BI comparison.
// Legacy dynamic routes still render InnerServiceDetail with their own technologies arrays.
export const technologyToolSources: readonly ToolSource[] = [
  main("Data", "data-engineering", "src/content/service-platforms.ts", dataPlatforms),
  sub("Data", "data-engineering/data-pipelines-integration", "Tools we use", pipelineTools),
  sub("Data", "data-engineering/data-warehousing-lakehouse", "Platforms", names(warehousePlatforms), platformText(warehousePlatforms)),
  sub("Data", "data-engineering/data-quality-governance", "Tools we use", names(qualityTools), platformText(qualityTools)),
  main("AI", "ai-solutions", "src/content/service-platforms.ts", aiPlatforms),
  sub("AI", "ai-solutions/rag-knowledge-assistants", "Full service content, Tech we use, integrations and RAG architecture", [...ragTools, ...ragSections.integrations.items.map(item => item.title)], JSON.stringify(ragSections)),
  sub("AI", "ai-solutions/ai-agents", "Full service content and Tech we use", agentTools, JSON.stringify(agentSections)),
  sub("AI", "ai-solutions/intelligent-automation", "Tools we use", intelligentAutomationTools),
  main("Cloud", "cloud-foundations", "src/content/service-platforms.ts", cloudPlatforms),
  {
    category: "Cloud", route: "/services/cloud-foundations", section: "Service descriptions and delivery workflow",
    sourceFile: serviceFile("cloud/cloud-foundations-content.ts"), names: [], text: JSON.stringify(cloudServiceIntroductions),
  },
  ...(["migration", "devops", "cost"] as const).map((key): ToolSource => {
    const page = cloudSubPages[key];
    return {
      category: "Cloud", route: `/services/cloud-foundations/${page.slug}`, section: "Platforms / Tools we use",
      sourceFile: "src/content/cloud-sub-services/pages.ts",
      names: [...(page.platforms ? names(page.platforms.items) : []), ...(page.tools ?? [])],
      text: page.platforms ? platformText(page.platforms.items) : undefined,
    };
  }),
  main("CRM", "crm-revenue-ops", serviceFile("crm-revenue-ops/crm-revenue-ops-content.ts"), crmContent.platforms),
  sub("CRM", "crm-revenue-ops/crm-implementation-integration", "Platforms", names(crmPlatforms), platformText(crmPlatforms)),
  sub("CRM", "crm-revenue-ops/sales-automation-revenue-analytics", "Tools we use", salesTools),
  main("Analytics", "analytics-bi", serviceFile("analytics-bi/analytics-bi-content.ts"), analyticsContent.platforms),
  // This page has no dedicated tool section. Keep the empty source to make audit coverage explicit.
  sub("Analytics", "analytics-bi/dashboards-executive-reporting", "No Tools & Platforms section", []),
  sub("Analytics", "analytics-bi/bi-consulting", "BI tool comparison and platform sections", biToolComparison.tools,
    JSON.stringify([biToolComparison.rows, biConsultingSections.powerBi, biConsultingSections.tableau, biConsultingSections.quickSight])),
  ...Object.entries(platformServices).flatMap(([group, services]) => Object.values(services)
    .filter(service => !legacyServiceRoutes[`/services/${group}/${service.slug}`])
    .map((service): ToolSource => ({
    category: ({ data: "Data", ai: "AI", cloud: "Cloud", crm: "CRM", analytics: "Analytics" } as const)[group as keyof typeof platformServices],
    route: `/services/${group}/${service.slug}`, section: "InnerServiceDetail toolkit",
    sourceFile: "src/content/platform-services.ts", names: service.technologies,
  }))),
  // Published case-study stacks observed on the rendered service pages during
  // the complete audit. Keep this dated evidence distinct from vendor/tool lists.
  {
    category: "Data", route: "/services/data-engineering", section: "Published case-study technology stack",
    sourceFile: "src/lib/case-studies.ts", names: ["Supabase"],
    evidence: "Rendered October 23, 2026: AI-Powered Customer Support Assistant lists Supabase in its Technology stack, alongside Python, FastAPI, OpenAI, LangChain, PostgreSQL, and pgvector.",
  },
  {
    category: "Cloud", route: "/services/cloud-foundations/cloud-architecture-migration", section: "Published case-study technology stack",
    sourceFile: "src/lib/case-studies.ts", names: ["React"],
    evidence: "Rendered October 23, 2026: Automating Legal Document Review with AI lists React in its Technology stack, alongside Python, FastAPI, PostgreSQL, LLMs, and RAG. LLMs is a general model class, not an additional product.",
  },
];

// These are capability, practice, or channel labels, not identifiable tools or products.
export const excludedTechnologyLabels: Readonly<Record<string, string>> = {
  CRM: "Generic service category; named CRM products are included from the sub-services.",
  "Business systems": "Generic capability, not a software product.",
  "Revenue reporting": "Generic capability, not a software product.",
  "Website chat": "Integration channel without a named software product.",
  FinOps: "Operating practice, not a software product.",
};

const aliases: Readonly<Record<string, string>> = {
  azure: "Microsoft Azure",
  bigquery: "Google BigQuery",
  kafka: "Apache Kafka",
  cloudwatch: "Amazon CloudWatch",
  "dynamics 365": "Microsoft Dynamics 365",
  "dbt tests": "dbt",
  "azure document intelligence": "Azure AI Document Intelligence",
  "cloud billing": "Google Cloud Billing",
  airflow: "Apache Airflow",
  "amazon web services": "AWS",
  claude: "Anthropic Claude",
  gemini: "Google Gemini",
  redshift: "Amazon Redshift",
  zoho: "Zoho CRM",
  "unity catalog": "Databricks Unity Catalog",
  rag: "Retrieval-augmented generation (RAG)",
};

export function normalizeTechnologyName(name: string) {
  const trimmed = name.trim().replace(/\s+/g, " ");
  return aliases[trimmed.toLowerCase()] ?? trimmed;
}

export function technologyIdentity(name: string) {
  return normalizeTechnologyName(name).toLowerCase();
}

// Additional exact product names present in platform copy, rather than card headings.
// Additional body and published case-study discoveries carry explicit source evidence above.
const mentionNames = ["Power BI Service", "Tableau Cloud", "Tableau Server", "Excel", "Cloud Billing", "AWS Cost Explorer", "Azure Cost Management", "RAG", "CI/CD", "GPT", "Claude", "Gemini"];
const candidates = [...new Set([...technologyToolSources.flatMap(source => source.names), ...mentionNames])]
  .filter(name => !excludedTechnologyLabels[name]).sort((a, b) => b.length - a.length);

function sectionMentions(text = "") {
  let remaining = text;
  const found: string[] = [];
  for (const name of candidates) {
    // The common verb in prose is not evidence of the Make automation product.
    if (name === "Make") continue;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const expression = new RegExp(`(?<![\\w])${escaped}(?![\\w])`, "gi");
    if (expression.test(remaining)) {
      found.push(name);
      // Do not infer a parent product from a longer name, e.g. Azure from Azure AI.
      remaining = remaining.replace(expression, " ");
    }
  }
  return found;
}

export function toolsForSource(source: ToolSource) {
  return [...new Set([...source.names, ...sectionMentions(source.text)]
    .filter(name => !excludedTechnologyLabels[name]).map(normalizeTechnologyName))];
}

// Primary display category is a deliberate product classification, separate from
// the complete service-page provenance. Never collapse a product into its vendor.
export const technologyPrimaryCategories: Readonly<Partial<Record<string, TechnologyCategory>>> = {
  AWS: "Cloud",
  "Microsoft Azure": "Cloud",
  "Google Cloud": "Cloud",
  Docker: "Cloud",
  PostgreSQL: "Data",
  Supabase: "Data",
  React: "Cloud",
  "AWS Lambda": "Cloud",
  GPT: "AI",
  "Retrieval-augmented generation (RAG)": "AI",
  "Open-source LLMs": "AI",
  "CI/CD": "Cloud",
  "Power BI": "Analytics",
  Tableau: "Analytics",
  Snowflake: "Data",
  "Microsoft Fabric": "Data",
  dbt: "Data",
  SQL: "Data",
  Python: "Data",
  n8n: "AI",
  Zapier: "AI",
  "Power Automate": "AI",
};

export type AuditedTechnology = { name: string; categories: TechnologyCategory[]; sources: string[]; primaryCategory: TechnologyCategory };

// Editorial selection only: names resolve against the audited service inventory.
// CRM includes workflow and communication integrations, as approved for this showcase.
export const technologyCuratedNames: Readonly<Record<TechnologyCategory, readonly string[]>> = {
  AI: [
    "OpenAI", "Anthropic Claude", "Google Gemini", "Azure OpenAI",
    "Azure AI", "Amazon Textract", "Azure AI Document Intelligence", "Google Document AI",
    "LangChain", "LangGraph", "LlamaIndex", "Pinecone",
    "Qdrant", "CrewAI", "Model Context Protocol (MCP)", "FastAPI",
  ],
  Data: [
    "Databricks", "Google BigQuery", "Amazon Redshift", "Azure Synapse",
    "Azure Data Factory", "AWS Glue", "Apache Spark", "Apache Airflow",
    "Apache Kafka", "Fivetran", "Airbyte", "PostgreSQL",
    "Python", "Great Expectations", "Collibra", "Alation",
  ],
  Cloud: [
    "AWS", "Microsoft Azure", "Google Cloud", "Docker",
    "Kubernetes", "Terraform", "GitHub Actions", "Jenkins",
    "Amazon CloudWatch", "AWS Lambda", "AWS Cost Explorer", "Azure Cost Management",
    "Google Cloud Billing", "Cloudflare", "Datadog", "OpenTelemetry",
  ],
  CRM: [
    "Salesforce", "HubSpot", "Microsoft Dynamics 365", "Zoho CRM",
    "MuleSoft", "Power Automate", "n8n", "Zapier",
    "Make", "Slack", "Microsoft Teams", "WhatsApp",
  ],
  Analytics: [
    "Power BI", "Tableau", "Amazon QuickSight", "Microsoft Fabric",
    "Snowflake", "dbt", "Excel", "Power Query",
    "Grafana", "Power BI Service", "Tableau Cloud", "Tableau Server",
  ],
};

const curatedCategories = new Map<string, TechnologyCategory>();
for (const category of technologyCategoryOrder) {
  const selected = technologyCuratedNames[category];
  if (selected.length < 12 || selected.length > 16) throw new Error(`Invalid curated tool count for ${category}`);
  for (const name of selected) {
    const identity = technologyIdentity(name);
    if (curatedCategories.has(identity)) throw new Error(`Duplicate curated technology: ${name}`);
    if (!getTechnologyLogoFiles(name, false).length) throw new Error(`Curated technology needs a verified logo: ${name}`);
    curatedCategories.set(identity, category);
  }
}

function buildInventory(): AuditedTechnology[] {
  const registry = new Map<string, AuditedTechnology>();
  for (const source of technologyToolSources) {
    for (const name of toolsForSource(source)) {
      const key = technologyIdentity(name);
      const tool = registry.get(key) ?? { name, categories: [], sources: [], primaryCategory: source.category };
      if (!tool.categories.includes(source.category)) tool.categories.push(source.category);
      if (!tool.sources.includes(source.route)) tool.sources.push(source.route);
      registry.set(key, tool);
    }
  }
  return [...registry.values()].map(tool => ({
    ...tool,
    primaryCategory: curatedCategories.get(technologyIdentity(tool.name)) ?? technologyPrimaryCategories[tool.name]
      ?? technologyCategoryOrder.find(category => tool.categories.includes(category))
      ?? tool.primaryCategory,
  }));
}

// One record per technology globally, with all relevant category and page associations.
export const technologyTools = buildInventory();

export function selectTechnologyShowcase(tools: readonly AuditedTechnology[]) {
  const identities = new Map<string, AuditedTechnology>();
  const omitted: { name: string; reason: "duplicate-tool"; keptTool: string }[] = [];
  // Identity, not artwork availability, determines membership in the showcase.
  // Different products remain visible even if their official family mark is shared.
  for (const tool of tools) {
    const identity = technologyIdentity(tool.name);
    const existing = identities.get(identity);
    if (existing) omitted.push({ name: tool.name, reason: "duplicate-tool", keptTool: existing.name });
    else identities.set(identity, tool);
  }
  return {
    tools: [...identities.values()],
    omitted,
  };
}

const registry = new Map(technologyTools.map(tool => [technologyIdentity(tool.name), tool]));
for (const identity of curatedCategories.keys()) {
  if (!registry.has(identity)) throw new Error(`Curated technology is not supported by service content: ${identity}`);
}
const showcase = selectTechnologyShowcase(technologyTools.filter(tool => curatedCategories.has(technologyIdentity(tool.name))));
export const technologyShowcaseTools = showcase.tools;
export const technologyShowcaseOmissions = [
  ...showcase.omitted,
  ...technologyTools.filter(tool => !curatedCategories.has(technologyIdentity(tool.name)))
    .map(tool => ({ name: tool.name, reason: "not-curated" as const })),
];

export const technologyToolGroups = technologyCategoryOrder.map(name => ({
  name,
  // Resolve curated references to their canonical audited names before pagination.
  tools: technologyCuratedNames[name].map(tool => registry.get(technologyIdentity(tool))!.name),
}));
