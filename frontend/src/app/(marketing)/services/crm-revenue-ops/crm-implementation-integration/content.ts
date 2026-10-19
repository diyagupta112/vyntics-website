import type { SubSection } from "@/content/cloud-sub-services/pages";
import type { MigrationEngagementStep } from "@/components/service-sub/migration-engagement-options.data";

export const crmImplementationService = {
  key: "crm-implementation-integration",
  slug: "crm-implementation-integration",
  name: "CRM Implementation & Integration",
  keyword: "CRM implementation services",
  seoTitle: "CRM Implementation Services | Vyntics",
  seoDescription: "CRM implementation services for businesses setting up, migrating, customizing, and integrating Salesforce, HubSpot, Zoho CRM, or Dynamics 365.",
  hero: {
    title: "CRM implementation services for a connected customer process",
    introduction: "Set up a new CRM, switch from an existing system, or connect customer data across the tools your teams use.",
    outcome: "Implement a CRM your team can use, update, and maintain.",
    cta: "Discuss your CRM implementation",
    expectedImage: "/images/services/our-services-section/crm-implementation.png",
    imageAlt: "Team collaborating around a CRM implementation workspace",
  },
} as const;

export const crmSections: { signs: SubSection; implementation: SubSection; integrations: SubSection; results: SubSection; related: SubSection } = {
  signs: { id: "crm-help-signs", title: "Signs you need CRM help", introduction: "A CRM should make customer information easier to manage, share, and act on.", items: [
    { title: "Leads tracked in spreadsheets", description: "Important opportunities live in separate files instead of a shared process." },
    { title: "A CRM nobody updates", description: "The CRM does not fit how your team works, so the information inside it is incomplete or out of date." },
    { title: "Duplicate contacts", description: "Repeated records make ownership, communication, and reporting harder to trust." },
    { title: "Data stuck between the CRM and other tools", description: "Customer information does not move reliably between the systems your teams use." },
  ] },
  implementation: { id: "crm-implementation-services", title: "Our CRM implementation services", introduction: "We help you choose, configure, and adopt a CRM around the way your teams work.", items: [
    { title: "CRM selection", description: "Compare practical options against your processes, users, data, and integration needs." },
    { title: "Setup and configuration", description: "Configure records, permissions, pipelines, fields, and workflows for your operating model." },
    { title: "Customisation", description: "Adapt the CRM experience where standard configuration does not meet a clear business need." },
    { title: "Data migration", description: "Plan, clean, map, and move data from spreadsheets or an existing CRM with reviewable checks." },
    { title: "User training", description: "Help teams understand the new process and the habits that keep CRM data useful." },
  ] },
  integrations: { id: "crm-integration-services", title: "Our CRM integration services", introduction: "Connect the CRM with the systems that create, enrich, and support your customer relationships.", items: [
    { title: "Website", description: "Connect forms and customer actions to the records and follow-up process your team owns." },
    { title: "Email", description: "Keep relevant conversations and messages connected to the right customer context." },
    { title: "ERP", description: "Link customer and commercial information across CRM and operational systems." },
    { title: "Accounting", description: "Connect billing and account information without creating duplicate manual work." },
    { title: "Support desk", description: "Give teams a clearer view of customer requests and account history." },
    { title: "Marketing tools", description: "Share consented customer and campaign context across marketing workflows." },
  ] },
  results: { id: "crm-results", title: "What a better CRM can improve", introduction: "We focus on outcomes your team can review after implementation, without assuming a fixed result.", items: [
    { title: "CRM adoption", description: "Make the system useful enough for teams to return to it as part of their normal work." },
    { title: "Time saved on data entry", description: "Reduce repeated updates by connecting the CRM to the tools where work already happens." },
    { title: "Data accuracy", description: "Use clearer ownership, validation, and reviewable migration checks to improve trust in records." },
  ] },
  related: { id: "crm-related-services", title: "Keep improving your customer operations", introduction: "Connect CRM implementation with the data and revenue services that support the next stage of growth.", items: [
    { title: "Sales Automation & Revenue Analytics", description: "Automate sales workflows and build clearer visibility into pipeline and revenue.", href: "/services/crm-revenue-ops/sales-automation-revenue-analytics", linkLabel: "Explore Sales Automation & Revenue Analytics" },
    { title: "Data Pipelines & Integration", description: "Build dependable connections between the systems your teams rely on.", href: "/services/data-engineering/data-pipelines-integration", linkLabel: "Explore Data Pipelines & Integration" },
  ] },
};

export const crmProcess = [
  { title: "Audit", visual: "Current process", description: "Review how your teams capture, update, and use customer information today." },
  { title: "Plan", visual: "Target CRM", description: "Agree the platform, scope, ownership, data, and integration priorities." },
  { title: "Configure", visual: "Working setup", description: "Set up the records, permissions, workflows, and views your teams need." },
  { title: "Migrate data", visual: "Checked records", description: "Map, clean, move, and review the data that belongs in the new CRM." },
  { title: "Train", visual: "Confident users", description: "Walk through the new process with the people who will use and own it." },
  { title: "Support", visual: "Continuous improvement", description: "Review feedback and help the CRM remain useful as your needs change." },
] as const;

export const crmEngagements: readonly MigrationEngagementStep[] = [
  { id: "crm-audit", number: "01", icon: "assess", title: "CRM audit", problem: "We need clarity on our current CRM and process.", description: "Review your systems, data, users, and priorities before deciding the next step.", bullets: ["Current process and data review", "Platform and integration priorities", "Practical next-step plan"] },
  { id: "crm-implementation", number: "02", icon: "migrate", title: "CRM implementation", problem: "We are ready to set up or switch CRM systems.", description: "Plan and deliver the configuration, migration, integration, and training work your team needs.", bullets: ["Agreed implementation scope", "Migration and integration checks", "User training and handover"] },
  { id: "crm-support", number: "03", icon: "manage", title: "Ongoing CRM support", problem: "We want help keeping the CRM useful.", description: "Continue improving workflows, data quality, integrations, and adoption as the business changes.", bullets: ["Review of user feedback", "Workflow and data improvements", "Agreed support priorities"] },
];

export const crmFaqs = [
  { question: "How long does CRM implementation take?", answer: "Timing depends on the platform, number of users, data condition, integrations, customization, and review cycles. We assess those dependencies before agreeing a practical implementation plan." },
  { question: "Should we choose Salesforce, HubSpot, Zoho or Dynamics 365?", answer: "The right choice depends on your processes, team, data, budget, integrations, and the level of configuration you need. We compare the options against those requirements rather than recommending one platform for every business." },
  { question: "Can you migrate our data from spreadsheets or another CRM?", answer: "Yes. We can map, clean, migrate, and check data from spreadsheets or an existing CRM as part of a reviewable migration plan." },
  { question: "Can our CRM connect to our ERP and other tools?", answer: "CRM integration services can connect the systems your teams rely on, subject to the available APIs, access, data model, and security requirements." },
  { question: "How do you make sure our team actually uses the CRM?", answer: "We involve users in the process, configure the CRM around real workflows, provide training, and review feedback after launch so adoption remains practical." },
  { question: "How much does CRM implementation cost?", answer: "Cost depends on platform selection, users, data migration, customization, integrations, and support. We clarify the scope and responsibilities before preparing an estimate." },
] as const;

export const crmPlatforms = [
  { name: "HubSpot", description: "HubSpot implementation can connect marketing, sales, service, and customer context in one workspace." },
  { name: "Zoho CRM", description: "Zoho CRM implementation can provide a configurable starting point for teams that need practical CRM workflows." },
  { name: "Microsoft Dynamics 365", description: "Dynamics 365 can connect customer operations with the wider Microsoft environment and business processes." },
] as const;

export const crmComparison = {
  platforms: ["HubSpot", "Zoho CRM", "Microsoft Dynamics 365"],
  rows: [
    { label: "Best suited for", cells: ["Teams that want marketing, sales, and service connected around one customer record.", "Teams that want a configurable CRM they can shape around their own workflows.", "Organizations already working in a Microsoft environment."] },
    { label: "Core strength", cells: ["Connected customer lifecycle, from campaigns to pipeline to service.", "Flexible modules, fields, and workflows that can be adapted to your process.", "CRM that sits alongside the wider Microsoft tools and data your teams already use."] },
    { label: "Configuration", cells: ["Lifecycle stages, pipelines, properties, and workflows set up around your sales process.", "Custom fields, modules, and automation rules designed around how your team works.", "Business processes, security roles, and data models designed for your organization."] },
    { label: "Ecosystem and integrations", cells: ["Connects marketing, sales, and service tools, with integrations planned around your stack.", "Connects with business apps and data sources, depending on the systems you run.", "Connects customer operations with the wider Microsoft environment and other business systems."] },
    { label: "Typical implementation needs", cells: ["Setup, data import, pipeline design, reporting, and team onboarding.", "Setup, field and workflow design, data migration, and user adoption.", "Setup, security design, data connections, migration, and user training."] },
  ],
} as const;
