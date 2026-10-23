export const technologyLogos: Readonly<Record<string, string | readonly string[]>> = {
  "Apache Airflow": "apache-airflow.svg",
  Airflow: "apache-airflow.svg",
  Snowflake: "snowflake.svg",
  "Google BigQuery": "google-bigquery.svg",
  SQL: "sql.svg",
  Python: "python.svg",
  Redis: "redis.svg",
  "Apache Spark": "apache-spark.svg",
  Cloudflare: "cloudflare.svg",
  Datadog: "datadog.svg",
  OpenTelemetry: "opentelemetry.svg",
  "Amazon Redshift": "aws.svg",
  "Amazon QuickSight": "aws.svg",
  "Power BI": "power-bi.svg",
  "Power Automate": "power-automate.svg",
  Tableau: "tableau.png",
  Salesforce: "salesforce.jpg",
  "Microsoft Dynamics 365": "dynamics-365.svg",
  "Dynamics 365": "dynamics-365.svg",
  HubSpot: "hubspot.svg",
  "Zoho CRM": "zoho.svg",
  "Microsoft Fabric": "microsoft-fabric.svg",
  Databricks: "databricks.svg",
  "Databricks Unity Catalog": "databricks.svg",
  "Azure Synapse": "azure.svg",
  "Azure AI": "azure.svg",
  "Azure Document Intelligence": "azure.svg",
  "Azure AI Document Intelligence": "azure.svg",
  "Amazon Textract": "aws.svg",
  "Google Document AI": "google-cloud.png",
  OpenAI: "openai.svg",
  Anthropic: "anthropic.svg",
  "Anthropic Claude": "claude.svg",
  "Google Gemini": "google-gemini.svg",
  Qdrant: "qdrant.svg",
  Pinecone: "pinecone.svg",
  "Pinecone & Qdrant": ["pinecone.svg", "qdrant.svg"],
  LangGraph: "langgraph.svg",
  "LangGraph & LangChain": ["langgraph.svg", "langchain.svg"],
  LangChain: "langchain.svg",
  "Model Context Protocol (MCP)": "mcp.svg",
  MCP: "mcp.svg",
  LlamaIndex: "llamaindex.png",
  "Open-source LLMs": "open-source-llm.svg",
  CrewAI: "crewai.svg",
  n8n: "n8n.svg",
  Make: "make.svg",
  Zapier: "zapier.svg",
  "FastAPI & PostgreSQL": ["fastapi.svg", "postgresql.svg"],
  FastAPI: "fastapi.svg",
  PostgreSQL: "postgresql.svg",
  pgvector: "postgresql.svg",
  dbt: "dbt.svg",
  "dbt tests": "dbt.svg",
  "Great Expectations": "great-expectations.png",
  "Monte Carlo": "monte-carlo.png",
  Collibra: "collibra.svg",
  Alation: "alation.svg",
  Fivetran: "fivetran.svg",
  Airbyte: "airbyte.svg",
  Kafka: "kafka.png",
  "Apache Kafka": "kafka.png",
  AWS: "aws.svg",
  "AWS Glue": "aws.svg",
  "Amazon Web Services": "aws.svg",
  Azure: "azure.svg",
  "Azure Data Factory": "azure.svg",
  "Microsoft Azure": "azure.svg",
  "Google Cloud": "google-cloud.png",
  "GitHub Actions": "github-actions.svg",
  Jenkins: "jenkins.svg",
  Terraform: "terraform.svg",
  Docker: "docker.svg",
  Kubernetes: "kubernetes.svg",
  Prometheus: "prometheus.svg",
  Grafana: "grafana.svg",
  CloudWatch: "cloudwatch.svg",
  "Amazon CloudWatch": "cloudwatch.svg",
  Slack: "slack.svg",
  "Microsoft Teams": "microsoft-teams.svg",
  "Website chat": "website-chat.svg",
  WhatsApp: "whatsapp.svg",
  SharePoint: "sharepoint.svg",
  "Google Drive": "google-drive.svg",
  Notion: "notion.svg",
  Confluence: "confluence.svg",
};

// These assets identify the parent platform, not every distinct product it sells.
export const parentBrandLogoOwners: Readonly<Record<string, readonly string[]>> = {
  "aws.svg": ["AWS", "Amazon Web Services"],
  "azure.svg": ["Microsoft Azure", "Azure"],
  "google-cloud.png": ["Google Cloud"],
  "databricks.svg": ["Databricks"],
  "postgresql.svg": ["PostgreSQL"],
};

// Product-specific showcase artwork. Service pages keep their existing mappings.
export const technologyProductLogos: Readonly<Record<string, string | readonly string[]>> = {
  React: "react.svg",
  Supabase: "supabase.svg",
  GPT: "openai.svg",
  Soda: "soda.png",
  "Google Document AI": "google-document-ai.svg",
  "Google Cloud Billing": "google-cloud-billing.svg",
  "Amazon Redshift": "aws-redshift.png",
  "Amazon QuickSight": "amazon-quicksight.png",
  "AWS Glue": "aws-glue.png",
  "AWS Lambda": "aws-lambda.png",
  "AWS Cost Explorer": "aws-cost-explorer.png",
  "Amazon Textract": "amazon-textract.png",
  "Azure Synapse": "azure-synapse.svg",
  "Azure Data Factory": "azure-data-factory.svg",
  "Azure AI": "azure-ai.svg",
  "Azure AI Document Intelligence": "azure-document-intelligence.svg",
  "Azure OpenAI": "azure-openai.svg",
  "Azure Cost Management": "azure-cost-management.svg",
  "Power Query": "power-query.svg",
  Excel: "excel.svg",
  MuleSoft: "mulesoft.png",
  "Power BI Service": "power-bi.svg",
  "Tableau Cloud": "tableau.png",
  "Tableau Server": "tableau.png",
  // A generic model illustration is not an official product logo.
  "Open-source LLMs": [],
};

export function getTechnologyLogoFiles(name: string, allowParentBrandLogo = true): readonly string[] {
  const logo = !allowParentBrandLogo && name in technologyProductLogos
    ? technologyProductLogos[name] : technologyLogos[name];
  const files = logo ? (typeof logo === "string" ? [logo] : logo) : [];
  if (!allowParentBrandLogo && files.some(file => parentBrandLogoOwners[file] && !parentBrandLogoOwners[file].includes(name))) return [];
  return files;
}

export function hasTechnologyLogo(name: string, allowParentBrandLogo = true) {
  return getTechnologyLogoFiles(name, allowParentBrandLogo).length > 0;
}

// Prefer the recognizable parent platform when a service product reuses its mark.
export function technologyLogoPriority(name: string) {
  const files = getTechnologyLogoFiles(name);
  if (files.some(file => parentBrandLogoOwners[file]?.includes(name))) return 2;
  return files.some(file => parentBrandLogoOwners[file]) ? 0 : 1;
}
