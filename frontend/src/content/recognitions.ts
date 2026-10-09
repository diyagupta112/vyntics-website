// TODO: Confirm Vyntics-specific official tiers, recognition dates, listing URLs,
// and approved badge artwork before publication. Program descriptions do not verify membership.
export type Recognition = {
  name: string;
  description: string;
  // Set src only when the actual approved asset is available.
  badge: { src?: string; expectedSrc: string; alt: string; width: number; height: number };
  directoryUrl?: string;
};

export const recognitions: readonly Recognition[] = [
  {
    name: "ChatGPT Select Partner",
    description: "Recognized by OpenAI as a [exact tier name] since [month, year]. This recognition reflects our experience building production AI solutions, including retrieval-based assistants grounded in client data.",
    badge: { expectedSrc: "/images/chatgpt-select-partner-vyntics.webp", alt: "Vyntics ChatGPT Select Partner badge", width: 240, height: 120 },
  },
  {
    name: "Databricks Partner",
    description: "Recognized as a [exact tier name] since [month, year]. This recognition reflects our experience designing data pipelines, analytics and lakehouse platforms for scale.",
    badge: { expectedSrc: "/images/databricks-partner-vyntics.webp", alt: "Vyntics Databricks Partner badge", width: 240, height: 120 },
  },
];
// No additional certification card until real certification names are supplied.

export const recognitionBenefits = [
  { title: "Proven expertise.", description: "Our engineers are trained and assessed on the platforms we use, from cloud infrastructure to analytics tools." },
  { title: "Best-practice delivery.", description: "We follow vendor-recommended architectures, so your systems are secure, scalable and supportable." },
  { title: "Direct vendor access.", description: "Partner status gives us support channels and early guidance when projects need them." },
  { title: "One team across your stack.", description: "We work across data engineering, AI, cloud, CRM, analytics and BI, so you don't juggle multiple vendors." },
] as const;

export const recognitionFaqs = [
  {
    question: "What certifications and recognitions does Vyntics hold?",
    answer: "Vyntics is recognized as a ChatGPT Select Partner and a partner of Databricks, with our team holding certifications in various cloud, data, and analytics platforms.",
    schemaReady: true,
  },
  {
    question: "What is a ChatGPT Select Partner?",
    // Official general program description; Vyntics' exact designation still needs confirmation.
    sourceUrl: "https://openai.com/index/introducing-openai-partner-network/",
    answer: "Select is a level in OpenAI's Partner Network that helps partners build, sell, and deliver AI solutions using OpenAI's technology. To move up to this tier, partners need to show they have strong technical skills, real experience putting solutions into use, good sales results, and active teamwork with OpenAI on selling.",
    schemaReady: true,
  },
  {
    question: "What does being a Databricks Partner mean?",
    sourceUrl: "https://www.databricks.com/partners/partner-program",
    answer: "Databricks offers partner programs that help consulting firms and other businesses build data and AI solutions using its platform. These programs give partners technical help, training, and support for integrations. The specific benefits you get depend on which program and level you choose.",
    schemaReady: true,
  },
  {
    question: "What services does Vyntics offer?",
    answer: "We provide data engineering, custom AI, cloud solutions, CRM systems, analytics and BI services. We work directly with your engineering team to build and improve your systems.",
    schemaReady: true,
  },
  {
    question: "Where is Vyntics based?",
    answer: "Vyntics is a tech consulting group located in Jaipur, India that serves clients around the world.",
    // TODO: Confirm client geography before including this answer in structured data.
    schemaReady: false,
  },
] as const;
