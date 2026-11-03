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
import { correctWord } from "./fuzzy";
import { simpleServices } from "./chatbot-simple";
import { serviceSitemap } from "@/content/service-sitemap";

export type ChatNode = {
  text: string;
  /** Extra words used only to match typed questions to this node. */
  keywords?: string;
  options: ReadonlyArray<readonly [label: string, next: string]>;
};

export const START_NODE = "start";

export const chatbotFlow: Record<string, ChatNode> = {
  start: {
    text: "Hello, I am the Vyntics Assistant. What would you like to know?",
    options: [
      ["Our services", "services"],
      ["Contact us", "contact"],
      ["Book a demo", "book:start"],
      ["About Vyntics", "about"],
      ["Website pages", "pages"],
    ],
  },

  pages: {
    text: "Here are the main pages of our website:\n\n- [Home](/)\n- [About](/about)\n- [Team](/about#team)\n- [Technologies](/technologies)\n- [Case studies](/case-studies)\n- [Blog](/blog)\n- [Careers](/careers)\n- [Recognition](/recognitions)\n- [Contact](/contact-us)\n- [Privacy policy](/privacy-policy)\n- [Terms and conditions](/terms-and-conditions)",
    options: [
      ["Our services", "services"],
      ["Contact us", "contact"],
      ["Book a demo", "book:start"],
      ["Back to start", "start"],
    ],
  },

  // Holders for the in-chat demo booking: the widget supplies the text, these nodes supply the buttons.
  booking: { text: "", options: [["Cancel booking", "book:cancel"]] },
  "booking-details": { text: "", options: [["Skip", "book:skip"], ["Cancel booking", "book:cancel"]] },
  "booking-confirm": { text: "", options: [["Send request", "book:send"], ["Cancel booking", "book:cancel"]] },
  "booking-error": { text: "", options: [["Try again", "book:send"], ["Cancel booking", "book:cancel"]] },
  "booking-done": {
    text: "",
    options: [
      ["Our services", "services"],
      ["Back to start", "start"],
    ],
  },

  // Holder for AI-written replies: the widget supplies the text, this node supplies the buttons.
  ai: {
    text: "",
    options: [
      ["Our services", "services"],
      ["Contact us", "contact"],
      ["Book a demo", "book:start"],
      ["Back to start", "start"],
    ],
  },

  fallback: {
    text: "I can only answer questions about Vyntics and the services on this website, and I could not find a match for that. Try one of these, or reach the team on our [Contact page](/contact-us).",
    options: [
      ["Our services", "services"],
      ["Contact us", "contact"],
      ["Book a demo", "book:start"],
      ["Back to start", "start"],
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
      ["Book a demo", "book:start"],
      ["Our services", "services"],
      ["Back to start", "start"],
    ],
  },

  demo: {
    text: "You can request a demo right here in the chat. Tap Book a demo and I will take your details and send them to the team. You can also use the form on our [Contact page](/contact-us).",
    options: [
      ["Book a demo", "book:start"],
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

const VIEW_WORDS: Record<string, string> = {
  deliver: "what you get deliverables offer include",
  process: "how we work process steps approach",
  outcomes: "outcomes results benefits",
  tech: "technologies tools stack",
};

/*
  Pillar and sub-service nodes are generated from the site's service sitemap, so names,
  descriptions and links always match the real service pages.
  Node ids: "pillar:<slug>" and "service:<pillar slug>/<service slug>".
*/
for (const pillar of serviceSitemap) {
  chatbotFlow[`pillar:${pillar.slug}`] = {
    text: `${pillar.description}\n\n${pillar.services.map((service) => `- ${service.name}: ${service.description}`).join("\n")}\n\nSee the full page: [${pillar.name}](/services/${pillar.slug}). Pick a service for more detail.`,
    keywords: pillar.name,
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

    const simple = simpleServices[service.slug];
    const lines = (items: readonly string[]) => items.map((item) => `- ${item}`).join("\n");
    const numbered = (items: readonly string[]) => items.map((item, i) => `${i + 1}. ${item}`).join("\n");

    chatbotFlow[id] = {
      keywords: service.name,
      text: simple
        ? `${simple.overview}\n\nSee the full page: ${link}.`
        : detail
          ? `${detail.introduction}\n\nSee the full page: ${link}.`
          : `${service.description} Read more on ${link}.`,
      options: [],
    };

    if (simple?.deliver.length) {
      chatbotFlow[`${id}:deliver`] = { text: `What you get with ${service.name}:\n\n${lines(simple.deliver)}`, options: [] };
      more.push(["What you get", `${id}:deliver`]);
    }
    if (simple?.steps.length) {
      chatbotFlow[`${id}:process`] = { text: `How we work on ${service.name}:\n\n${numbered(simple.steps)}`, options: [] };
      more.push(["How we work", `${id}:process`]);
    }
    if (simple?.outcomes.length) {
      chatbotFlow[`${id}:outcomes`] = { text: `What you can expect from ${service.name}:\n\n${lines(simple.outcomes)}`, options: [] };
      more.push(["Outcomes", `${id}:outcomes`]);
    }
    if (detail?.technologies.length) {
      chatbotFlow[`${id}:tech`] = {
        text: `Tools we often use for ${service.name}: ${detail.technologies.join(", ")}.`,
        options: [],
      };
      more.push(["Technologies", `${id}:tech`]);
    }

    // Every detail node offers the other detail views, then the common exits.
    const views = more.map(([label, node]) => [`${id}`, label, node] as const);
    const detailNodes = [id, ...more.map(([, node]) => node)];
    for (const nodeId of detailNodes) {
      const view = nodeId.slice(id.length + 1);
      if (view) chatbotFlow[nodeId].keywords = `${service.name} ${VIEW_WORDS[view] ?? ""}`;
      chatbotFlow[nodeId].options = [
        ...views.filter(([, , node]) => node !== nodeId).map(([, label, node]) => [label, node] as const),
        ...(nodeId === id ? [] : ([["Overview", id]] as const)),
        [`More in ${pillar.name}`, `pillar:${pillar.slug}`],
        ["Contact us", "contact"],
        ["Book a demo", "book:start"],
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


// Words for matching typed questions to static nodes.
chatbotFlow.services.keywords = "services offer do solutions";
chatbotFlow.contact.keywords = "contact reach email message talk call phone address";
chatbotFlow.demo.keywords = "demo book meeting schedule consultation quote pricing price";
chatbotFlow.pages.keywords = "pages page website link links sitemap menu careers jobs blog articles case studies team technologies recognition awards privacy terms conditions home";
chatbotFlow.about.keywords = "about company vyntics who team";

const STOP_WORDS = new Set(["the", "and", "for", "you", "your", "with", "what", "how", "can", "does", "are", "have", "about", "tell", "please", "need", "want", "any", "our", "this", "that"]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

// Every word used in the answers, so misspelled words in a question can be matched to real ones.
let vocabularyCache: Set<string> | null = null;
function knownWords(): Set<string> {
  if (!vocabularyCache) {
    vocabularyCache = new Set();
    for (const node of Object.values(chatbotFlow)) {
      for (const word of tokens(`${node.keywords ?? ""} ${node.text}`)) vocabularyCache.add(word);
    }
  }
  return vocabularyCache;
}

/**
 * MOCK SEARCH: picks the node that best matches a typed question by comparing words.
 * Replace the body with a real API call later; it only needs to return a node id.
 */
export function findAnswerNode(query: string): string {
  const vocabulary = knownWords();
  const words = tokens(query).map((word) => correctWord(word, vocabulary, vocabulary));
  if (!words.length) return "fallback";
  let best = "fallback";
  let bestScore = 0;
  for (const [id, node] of Object.entries(chatbotFlow)) {
    if (id === "start" || id === "fallback" || id === "ai" || id.startsWith("booking")) continue;
    const keywords = tokens(node.keywords ?? "");
    const body = tokens(node.text);
    let score = 0;
    for (const word of words) {
      if (keywords.some((k) => k === word || (word.length > 3 && k.startsWith(word)))) score += 3;
      else if (body.includes(word)) score += 1;
    }
    if (score > bestScore) {
      best = id;
      bestScore = score;
    }
  }
  return bestScore >= 2 ? best : "fallback";
}
