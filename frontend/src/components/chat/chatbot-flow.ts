/*
  Guided chatbot conversation. Edit this file to change what the assistant says.

  Each key is a node id. A node has:
    - text:    the bot message. Use [label](/path) for internal links.
    - options: [button label, next node id] pairs shown as tappable buttons.

  The conversation starts at START_NODE. Routes below are real site routes.
*/

import { biConsultingSections, biConsultingService, biProcess } from "@/app/(marketing)/services/analytics-bi/bi-consulting/content";
import { aiServices } from "@/content/ai-services";
import type { AiServiceSlug } from "@/content/ai-services";
import { dataServices } from "@/content/data-services";
import type { DataServiceSlug } from "@/content/data-services";
import { getPlatformService } from "@/content/platform-services";
import type { PlatformServiceGroup } from "@/content/platform-services";
import { serviceSitemap } from "@/content/service-sitemap";

export type ChatNode = {
  text: string;
  options: ReadonlyArray<readonly [label: string, next: string]>;
};

export const START_NODE = "start";

export const chatbotFlow: Record<string, ChatNode> = {
  start: {
    text: "Hello, I am the Vyntics Assistant. What would you like to know?",
    options: [
      ["Our services", "services"],
      ["Contact us", "contact"],
      ["Book a demo", "demo"],
      ["About Vyntics", "about"],
    ],
  },

  services: {
    text: "We work across five areas. Pick one to learn more.",
    options: [
      ...serviceSitemap.map((pillar) => [pillar.name, `pillar:${pillar.slug}`] as const),
      ["Back to start", "start"],
    ],
  },

  contact: {
    text: "You can send the team a message on our [Contact page](/contact-us). We will get back to you.",
    options: [
      ["Book a demo", "demo"],
      ["Our services", "services"],
      ["Back to start", "start"],
    ],
  },

  demo: {
    text: "To book a demo, use the form on our [Contact page](/contact-us) and mention that you would like a demo.",
    options: [
      ["Our services", "services"],
      ["Contact us", "contact"],
      ["Back to start", "start"],
    ],
  },

  about: {
    text: "Vyntics helps teams with data engineering, analytics, cloud, CRM and AI. Learn more on our [About page](/about).",
    options: [
      ["Our services", "services"],
      ["Contact us", "contact"],
      ["Back to start", "start"],
    ],
  },
};

// BI Consulting has no sitemap sources: its content lives with its page, so it is mapped here.
const biConsultingDetail: Detail = {
  introduction: biConsultingService.hero.introduction,
  promiseDetail: biConsultingSections.services.introduction,
  deliverables: biConsultingSections.services.items,
  process: biProcess,
  outcomes: biConsultingSections.results.items.map((item) => `${item.title}: ${item.description}`),
  technologies: ["Power BI", "Tableau", "Amazon QuickSight"],
};

/*
  Pillar and sub-service nodes are generated from the site's service sitemap, so names,
  descriptions and links always match the real service pages.
  Node ids: "pillar:<slug>" and "service:<pillar slug>/<service slug>".
*/
for (const pillar of serviceSitemap) {
  chatbotFlow[`pillar:${pillar.slug}`] = {
    text: `${pillar.description}\n\n${pillar.services.map((service) => `- ${service.name}: ${service.description}`).join("\n")}\n\nSee the full page: [${pillar.name}](/services/${pillar.slug}). Pick a service for more detail.`,
    options: [
      ...pillar.services.map((service) => [service.name, `service:${pillar.slug}/${service.slug}`] as const),
      ["Other services", "services"],
      ["Back to start", "start"],
    ],
  };

  for (const service of pillar.services) {
    const id = `service:${pillar.slug}/${service.slug}`;
    const detail = findDetail(service.slug, service.sources, pillar.base);
    const link = `[${service.name}](/services/${pillar.slug}/${service.slug})`;
    const more: Array<readonly [string, string]> = [];

    chatbotFlow[id] = {
      text: detail
        ? `${detail.introduction}\n\n${detail.promiseDetail}\n\nSee the full page: ${link}.`
        : `${service.description} Read more on ${link}.`,
      options: [],
    };

    if (detail?.deliverables.length) {
      chatbotFlow[`${id}:deliver`] = {
        text: `What you get with ${service.name}:\n\n${detail.deliverables.map((d) => `- ${d.title}: ${d.description}`).join("\n")}`,
        options: [],
      };
      more.push(["What you get", `${id}:deliver`]);
    }
    if (detail?.process.length) {
      chatbotFlow[`${id}:process`] = {
        text: `How we work on ${service.name}:\n\n${detail.process.map((p, i) => `${i + 1}. ${p.title}: ${p.description}`).join("\n")}`,
        options: [],
      };
      more.push(["How we work", `${id}:process`]);
    }
    if (detail?.outcomes?.length) {
      chatbotFlow[`${id}:outcomes`] = {
        text: `Outcomes you can expect from ${service.name}:\n\n${detail.outcomes.map((o) => `- ${o}`).join("\n")}`,
        options: [],
      };
      more.push(["Outcomes", `${id}:outcomes`]);
    }
    if (detail?.technologies.length) {
      chatbotFlow[`${id}:tech`] = {
        text: `Technologies we commonly use for ${service.name}: ${detail.technologies.join(", ")}.`,
        options: [],
      };
      more.push(["Technologies", `${id}:tech`]);
    }

    // Every detail node offers the other detail views, then the common exits.
    const views = more.map(([label, node]) => [`${id}`, label, node] as const);
    const detailNodes = [id, ...more.map(([, node]) => node)];
    for (const nodeId of detailNodes) {
      chatbotFlow[nodeId].options = [
        ...views.filter(([, , node]) => node !== nodeId).map(([, label, node]) => [label, node] as const),
        ...(nodeId === id ? [] : ([["Overview", id]] as const)),
        [`More in ${pillar.name}`, `pillar:${pillar.slug}`],
        ["Contact us", "contact"],
        ["Book a demo", "demo"],
      ];
    }
  }
}

type Detail = {
  introduction: string;
  promiseDetail: string;
  deliverables: ReadonlyArray<{ title: string; description: string }>;
  process: ReadonlyArray<{ title: string; description: string }>;
  outcomes?: readonly string[];
  technologies: readonly string[];
};

// Looks up the real service page content: the sitemap sources first, then the service's own slug.
function findDetail(
  serviceSlug: string,
  sources: ReadonlyArray<{ group: string; slug: string }>,
  groupHint: string,
): Detail | undefined {
  if (serviceSlug === "bi-consulting") return biConsultingDetail;
  for (const { group, slug } of sources) {
    const found =
      group === "ai"
        ? aiServices[slug as AiServiceSlug]
        : group === "data"
          ? dataServices[slug as DataServiceSlug]
          : getPlatformService(group as PlatformServiceGroup, slug);
    if (found) return found;
  }
  const group = sources[0]?.group ?? groupHint;
  if (group === "ai" || group === "data") return undefined;
  // Some platform entries use the British spelling in their slug.
  return (
    getPlatformService(group as PlatformServiceGroup, serviceSlug) ??
    getPlatformService(group as PlatformServiceGroup, serviceSlug.replace("optimization", "optimisation"))
  );
}
