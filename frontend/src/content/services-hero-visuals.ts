import type { ServicePillar } from "./service-exploration";
import aiHeroImage from "../../public/images/services/hero/ai.jpg";

export type ServicesHeroVisual = {
  image: string;
  alt: string;
  position: string;
  iconPath: string;
};

// Existing Vyntics assets; these visuals make no numeric or client-result claims.
export const servicesHeroVisuals: Record<ServicePillar, ServicesHeroVisual> = {
  "ai-solutions": { image: aiHeroImage.src, alt: "Vyntics team collaborating around a laptop on an AI solutions project.", position: "50% 35%", iconPath: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" },
  "data-engineering": { image: "/images/services/hero/data.jpg", alt: "Vyntics team collaborating around a laptop on a data engineering project.", position: "center", iconPath: "M5 5h14v5H5zM5 14h14v5H5zM12 10v4M8 7.5h.01M8 16.5h.01" },
  "analytics-bi": { image: "/images/services/hero/bi2.jpg", alt: "Colleagues reviewing analytics on a laptop beside a bar chart display.", position: "center", iconPath: "M4 20h16M7 16v-4M12 16V8M17 16V4" },
  "cloud-foundations": { image: "/images/services/hero/cloud.jpg", alt: "Person using a laptop beside server racks in a data center.", position: "center", iconPath: "M6 17a5 5 0 1 1 1-10 6 6 0 0 1 11 2 4 4 0 0 1 0 8H6Z" },
  "crm-revenue-ops": { image: "/images/services/hero/crm.jpg", alt: "Vyntics team collaborating around a laptop on a CRM project.", position: "center", iconPath: "M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM5 21v-3a7 7 0 0 1 14 0v3" },
};
