// Shared with the service pillar pages. Keep platform names and descriptions in one place.
export const dataPlatforms = [
  { name: "Databricks", role: "Lakehouse", description: "Unified engineering, analytics, and machine-learning workloads over structured and unstructured data." },
  { name: "Snowflake", role: "Cloud data platform", description: "Elastic warehousing, governed sharing, and workload separation for analytical teams." },
  { name: "Google BigQuery", role: "Serverless warehouse", description: "Managed analytical compute for teams that need scale without operating warehouse infrastructure." },
  { name: "Amazon Redshift", role: "AWS warehousing", description: "Integrated cloud warehousing for organizations already building their data estate on AWS." },
  { name: "Microsoft Fabric", role: "Microsoft data platform", description: "Integrated engineering, warehousing, semantic models, and Power BI delivery in one ecosystem." },
  { name: "dbt", role: "Transformation", description: "Versioned SQL models, tests, documentation, and lineage for maintainable analytics engineering." },
] as const;

export const aiPlatforms = [
  { name: "OpenAI", role: "Language models", description: "Reasoning, generation, structured outputs, embeddings, and tool use across production AI workloads." },
  { name: "Anthropic", role: "Language models", description: "Long-context reasoning and generation for knowledge, analysis, and controlled agent workflows." },
  { name: "n8n", role: "Workflow automation", description: "Coordinate repeatable workflows, system actions, and automated hand-offs." },
  { name: "Pinecone", role: "Vector retrieval", description: "Scalable semantic search, metadata filtering, and retrieval across enterprise knowledge collections." },
  { name: "Qdrant", role: "Vector retrieval", description: "Scalable semantic search, metadata filtering, and retrieval across enterprise knowledge collections." },
  { name: "LangGraph", role: "AI orchestration", description: "Stateful agent workflows, tool coordination, and human checkpoints." },
  { name: "LangChain", role: "AI orchestration", description: "Retrieval pipelines, tool coordination, and tracing across AI workflows." },
  { name: "Azure AI", role: "Enterprise AI", description: "Governed model access and document intelligence for organizations operating in the Microsoft ecosystem." },
] as const;

export const cloudPlatforms = [
          { name: "AWS", role: "Cloud infrastructure", description: "Architecture, workload migration, and operational tooling for applications and data on AWS." },
          { name: "Azure", role: "Microsoft cloud", description: "Cloud infrastructure services that connect Microsoft environments with secure, manageable Azure workloads." },
          { name: "Google Cloud", role: "Applications and data", description: "Cloud services for businesses building applications and data platforms on Google Cloud." },
        ] as const;
