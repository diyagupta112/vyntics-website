import { serviceSitemap } from "./service-sitemap";

export type ServicePillar = "cloud-foundations" | "data-engineering" | "analytics-bi" | "ai-solutions" | "crm-revenue-ops";

const serviceNames = Object.fromEntries(serviceSitemap.map((service) => [service.slug, service.name])) as Record<ServicePillar, string>;

// Use the corresponding service images from the Technologies page.
export const explorationServices: Record<ServicePillar, { name: string; description: string; image: string; iconPath: string }> = {
  "cloud-foundations": { name: serviceNames["cloud-foundations"], description: "Secure, scalable cloud architecture, migration and cost optimization.", image: "/images/technology-cloud-network.png", iconPath: "M4 9 12 4l8 5-8 5-8-5Zm0 6 8 5 8-5M4 20l8 5 8-5" },
  "data-engineering": { name: serviceNames["data-engineering"], description: "Reliable pipelines and platforms that make your data ready to use.", image: "/images/technology-data-finance-dashboard.png", iconPath: "M4 6h6v6H4zM14 16h6v6h-6zM16 6h5v5M21 6l-9 9" },
  "analytics-bi": { name: serviceNames["analytics-bi"], description: "Dashboards and reporting that turn your data into decisions.", image: "/images/technology-analytics-connected.png", iconPath: "M4 20h17M7 16v-4M12 16V8M17 16V4" },
  "ai-solutions": { name: serviceNames["ai-solutions"], description: "AI assistants, agents and automation built around your own data.", image: "/images/technology-ai-robot.png", iconPath: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" },
  "crm-revenue-ops": { name: serviceNames["crm-revenue-ops"], description: "CRM implementation and analytics that fit how your team sells.", image: "/images/technology-crm-workspace.png", iconPath: "M15 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM5 21v-3a7 7 0 0 1 14 0v3M19 5a3 3 0 0 1 0 6M21 15a5 5 0 0 1 3 5" },
};
export const serviceExplorationOrder: Record<ServicePillar, readonly ServicePillar[]> = {
  "cloud-foundations": ["data-engineering", "analytics-bi", "ai-solutions", "crm-revenue-ops"],
  "data-engineering": ["analytics-bi", "ai-solutions", "cloud-foundations", "crm-revenue-ops"],
  "analytics-bi": ["ai-solutions", "data-engineering", "crm-revenue-ops", "cloud-foundations"],
  "ai-solutions": ["crm-revenue-ops", "data-engineering", "analytics-bi", "cloud-foundations"],
  "crm-revenue-ops": ["analytics-bi", "ai-solutions", "data-engineering", "cloud-foundations"],
};
