import type { Badge } from "@/lib/badges";

export type RecognitionUpdate = {
  id: string;
  type: "badge" | "testimonial";
  title: string;
  fullText?: string;
  fullRole?: string;
  name?: string;
  detail: string;
  tag: string;
  image?: string;
  imageAlt?: string;
  initials?: string;
  gradient?: { src: string; transform: string };
};

const feedGradients = [
  "/images/bottom-left-gradient.webp",
  "/images/top-right-gradient.webp",
  "/images/diagonal-sweep-gradient.webp",
];

const testimonialLogos: Record<string, { src: string; alt: string }> = {
  mona: { src: "/images/clients/smgqlogo.png", alt: "SMGQ Law logo" },
  sergio: { src: "/images/clients/iturbelogo.png", alt: "Iturbe Properties logo" },
  balazs: { src: "/images/clients/rolloutitlogo.png", alt: "Rollout IT logo" },
};
const backgroundTransforms = ["none", "scale(-1, -1)", "scaleX(-1)", "scaleY(-1)", "scaleX(-1)", "scale(-1, -1)"];

export function recognitionCardGradient(index: number) {
  return { src: feedGradients[index % feedGradients.length], transform: backgroundTransforms[index % backgroundTransforms.length] };
}

export function recognitionUpdates(badges: readonly Badge[]): RecognitionUpdate[] {
  const updates: RecognitionUpdate[] = [
    { id: "openai", type: "badge", title: "Recognized as an OpenAI Select Partner", detail: "Building AI assistants and automation around our clients' data", tag: "Recognition", image: badges.find(badge => badge.name === "OpenAI Select Partner")?.logo_url ?? undefined, imageAlt: "Vyntics OpenAI Select Partner badge" },
    { id: "mona", type: "testimonial", title: "They developed a seamless, automated ingestion engine that streamlined our entire reporting process.", fullText: "Arun and the Vyntics team transformed our data workflows. They developed a seamless, automated ingestion engine that streamlined our entire reporting process while remaining timely and budget-conscious. Their technical mastery of Cloud Data Warehousing makes them an indispensable partner.", detail: "Mona McCormick, SMGQ Law", name: "Mona McCormick", fullRole: "Business & Royalty Analytics, SMGQ Law", tag: "Data Engineering", initials: "MM" },
    { id: "sergio", type: "testimonial", title: "Their technical precision and reliability made a complex migration feel effortless.", fullText: "Vyntics team seamlessly transitioned our workforce to a fully remote AWS environment. Their technical precision and reliability made a complex migration feel effortless. They will be our first choice as we expand into advanced data analytics.", detail: "Sergio Iturbe, ITURBE PROPERTIES", name: "Sergio Iturbe", fullRole: "Managing Director, ITURBE PROPERTIES", tag: "Cloud Migration", initials: "SI" },
    { id: "databricks", type: "badge", title: "Recognized as a Databricks Brickbuilder Partner", detail: "Delivering data pipelines and analytics on Databricks", tag: "Recognition", image: badges.find(badge => badge.name === "Databricks Brickbuilder Partner")?.logo_url ?? undefined, imageAlt: "Vyntics Databricks Brickbuilder Partner Network Bronze badge" },
    { id: "balazs", type: "testimonial", title: "Vyntics transformed our raw data into a powerful decision-making tool.", fullText: "Vyntics transformed our raw data into a powerful decision-making tool. Arun's proactive approach to understanding our requirements resulted in comprehensive dashboards that far exceeded our expectations. Their technical intensity and commitment to excellence made them a pleasure to work with. A top-tier partner for data analytics.", detail: "Balazs, Rollout IT", name: "Balazs", fullRole: "Founder & CEO, Rollout IT", tag: "Analytics & BI", initials: "B" },
  ];
  return updates.map((item, index) => ({
    ...item,
    ...(testimonialLogos[item.id] ? { image: testimonialLogos[item.id].src, imageAlt: testimonialLogos[item.id].alt } : {}),
    gradient: recognitionCardGradient(index),
  }));
}
