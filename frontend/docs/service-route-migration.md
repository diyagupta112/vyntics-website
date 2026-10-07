# Services route migration

The canonical sitemap is `src/content/service-sitemap.ts`: five pillars and thirteen service pages. Header and footer share its navigation. New pages reuse existing service templates and content; merged offerings combine existing capabilities and technologies.

## Redirects

`next.config.ts` applies permanent HTTP 308 redirects from `src/content/service-route-map.ts`. Each maps directly to a canonical route. Existing route files are retained for compatibility; redirects take precedence.

| Old URL | Canonical URL |
| --- | --- |
| `/services/cloud` | `/services/cloud-foundations` |
| `/services/data` | `/services/data-engineering` |
| `/services/crm` | `/services/crm-revenue-ops` |
| `/services/cloud/cloud-architecture` | `/services/cloud-foundations/cloud-architecture-migration` |
| `/services/cloud/cloud-migration` | `/services/cloud-foundations/cloud-architecture-migration` |
| `/services/cloud/devops-infrastructure` | `/services/cloud-foundations/devops-reliability` |
| `/services/cloud/reliability-monitoring` | `/services/cloud-foundations/devops-reliability` |
| `/services/cloud/cost-optimization` | `/services/cloud-foundations/cloud-cost-optimization` |
| `/services/data/data-pipelines` | `/services/data-engineering/data-pipelines-integration` |
| `/services/data/data-integration` | `/services/data-engineering/data-pipelines-integration` |
| `/services/data/etl-elt` | `/services/data-engineering/data-pipelines-integration` |
| `/services/data/data-warehousing` | `/services/data-engineering/data-warehousing-lakehouse` |
| `/services/data/data-quality` | `/services/data-engineering/data-quality-governance` |
| `/services/analytics/kpi-dashboards` | `/services/analytics-bi/dashboards-executive-reporting` |
| `/services/analytics/executive-reporting` | `/services/analytics-bi/dashboards-executive-reporting` |
| `/services/analytics/power-bi` | `/services/analytics-bi/dashboards-executive-reporting` |
| `/services/analytics/tableau` | `/services/analytics-bi/dashboards-executive-reporting` |
| `/services/analytics/amazon-quicksight` | `/services/analytics-bi/dashboards-executive-reporting` |
| `/services/ai/rag-assistants` | `/services/ai-solutions/rag-knowledge-assistants` |
| `/services/ai/ai-agents` | `/services/ai-solutions/ai-agents` |
| `/services/ai/document-automation` | `/services/ai-solutions/intelligent-automation` |
| `/services/ai/workflow-automation` | `/services/ai-solutions/intelligent-automation` |
| `/services/crm/crm-implementation` | `/services/crm-revenue-ops/crm-implementation-integration` |
| `/services/crm/crm-integrations` | `/services/crm-revenue-ops/crm-implementation-integration` |
| `/services/crm/sales-automation` | `/services/crm-revenue-ops/sales-automation-revenue-analytics` |
| `/services/crm/crm-analytics` | `/services/crm-revenue-ops/sales-automation-revenue-analytics` |
| `/services/cloud/architecture` | `/services/cloud-foundations/cloud-architecture-migration` |
| `/services/cloud/migration` | `/services/cloud-foundations/cloud-architecture-migration` |
| `/services/ai` | `/services/ai-solutions` |
| `/services/analytics` | `/services/analytics-bi` |

## Unmapped legacy pages

- `/services/ai/llm-integrations`: product/backend LLM integration is not necessarily retrieval, agents, or automation. Retained without a guessed redirect.
- `/services/other`: combines backend APIs, integration, and advisory with no single equivalent. Retained without a guessed redirect.

Neither appears in canonical service navigation.

## Content decisions

Power BI, Tableau, and QuickSight previously describe dashboard implementation; they map to Dashboards & Executive Reporting. BI Consulting has no direct legacy page; its initial copy reuses the existing BI approach and data foundations. No new claims were introduced. Cloud pages retain their specialized layout. Other service pages retain the shared service-page/detail layouts.

## Verification

`npm test` includes routing invariants: pillar/service counts, complete mapped-source coverage, valid destinations, no redirect chains/loops, cloud aliases, and retained unmapped pages. Production HTTP verification checks all 19 canonical URLs and all 30 redirects.
