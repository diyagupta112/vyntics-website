import type { SubSection } from "@/content/cloud-sub-services/pages";
import type { MigrationEngagementStep } from "@/components/service-sub/migration-engagement-options.data";

export const salesAutomationService = {
  key: "sales-automation-revenue-analytics",
  slug: "sales-automation-revenue-analytics",
  name: "Sales Automation & Revenue Analytics",
  seoTitle: "Sales Automation Services | Vyntics",
  seoDescription: "Vyntics helps sales teams automate lead routing and follow-up, improve CRM workflows, and build clearer pipeline analytics and revenue reporting.",
  hero: {
    title: "Sales automation services for clearer pipeline and revenue",
    introduction: "We help sales and revenue teams reduce manual admin, strengthen follow-through, and see what is happening across their pipeline and revenue.",
    outcome: "Connect sales process automation with reporting your team can use.",
    cta: "Discuss sales automation",
    expectedImage: "/images/services/our-services-section/sales-automation.png",
    imageAlt: "Team reviewing an automated lead follow-up workflow on a laptop",
  },
} as const;

export const salesSections: {
  signs: SubSection;
  automation: SubSection;
  analytics: SubSection;
  results: SubSection;
  related: SubSection;
} = {
  signs: {
    id: "sales-automation-signs",
    title: "Signs you need sales automation",
    introduction: "Manual work and unclear follow-through can make it harder to keep a consistent view of sales activity.",
    items: [
      { title: "Reps spending hours on admin", description: "Routine updates and coordination take time away from customer conversations." },
      { title: "Leads falling through the cracks", description: "Ownership or next steps are not always clear when a new lead arrives." },
      { title: "Slow follow-ups", description: "The process depends on manual reminders and individual habits to keep a response moving." },
      { title: "No reliable forecast", description: "Pipeline stages or reporting definitions may not provide a consistent view of expected revenue." },
    ],
  },
  automation: {
    id: "sales-automation-services",
    title: "Our sales automation services",
    introduction: "We automate agreed sales process steps around the CRM, ownership rules, and follow-up expectations your team uses.",
    items: [
      { title: "Lead routing", description: "Assign incoming leads using agreed ownership rules and routing conditions." },
      { title: "Lead scoring", description: "Organize lead signals into a score that helps teams prioritize follow-up." },
      { title: "Automated follow-ups and email sequences", description: "Coordinate approved follow-up messages and sequences around customer stage and team process." },
      { title: "Task and deal automation", description: "Create reminders and workflow steps around agreed deal stages and handoffs." },
      { title: "Quote and proposal workflows", description: "Structure quote and proposal steps, review points, and ownership in the sales process." },
    ],
  },
  analytics: {
    id: "revenue-analytics-services",
    title: "Our revenue analytics services",
    introduction: "Use consistent pipeline and performance reporting to understand movement, outcomes, and areas that need attention.",
    items: [
      { title: "Pipeline dashboards", description: "Review pipeline value, stage movement, deal aging, and coverage using agreed definitions." },
      { title: "Sales forecasting", description: "Bring forecast assumptions and pipeline signals into a view that teams can review together." },
      { title: "Win/loss analysis", description: "Organize deal outcomes and available context to help teams review patterns over time." },
      { title: "Rep performance", description: "Review sales activity and outcomes with clear context about measures and ownership." },
      { title: "Revenue reporting", description: "Bring commercial measures into repeatable reports for sales and leadership audiences." },
    ],
  },
  results: {
    id: "sales-automation-results",
    title: "What sales automation can improve",
    introduction: "We focus on measures your team can review over time, without assuming a fixed result or target.",
    items: [
      { title: "Hours saved per rep", description: "Review how workflow automation changes the time spent on repeated administration." },
      { title: "Lead response time", description: "Track how quickly new leads move through ownership and follow-up steps." },
      { title: "Forecast accuracy", description: "Compare forecasts with outcomes and refine the definitions and process behind them." },
      { title: "Conversion rate", description: "Follow agreed conversion measures across stages to see where opportunities progress or stall." },
    ],
  },
  related: {
    id: "sales-related-services",
    title: "Connect sales operations with CRM and reporting",
    introduction: "Sales automation and revenue analytics depend on a CRM your team can use and clear reporting across the customer journey.",
    items: [
      { title: "CRM Implementation & Integration", description: "Configure and connect customer systems around the way your teams work.", href: "/services/crm-revenue-ops/crm-implementation-integration", linkLabel: "Explore CRM Implementation & Integration" },
      { title: "Dashboards & Executive Reporting", description: "Build decision-focused dashboards and automated reporting for teams and leadership.", href: "/services/analytics-bi/dashboards-executive-reporting", linkLabel: "Explore Dashboards & Executive Reporting" },
    ],
  },
};

export const salesProcess = [
  { title: "Map the sales process", visual: "Stages and handoffs", description: "Review how leads, opportunities, follow-ups, and ownership move through the current sales process." },
  { title: "Automate", visual: "Agreed workflow steps", description: "Configure routing, tasks, and follow-up automation around agreed rules and team responsibilities." },
  { title: "Build dashboards", visual: "Pipeline and revenue views", description: "Define and implement pipeline, performance, and revenue reporting with your team." },
  { title: "Train", visual: "Team adoption", description: "Walk users through the workflow, reporting definitions, and practical ownership." },
  { title: "Improve", visual: "Review and refine", description: "Use feedback and agreed performance measures to identify workflow and reporting changes." },
] as const;

export const salesTools = ["HubSpot", "Zoho CRM", "Power BI", "Tableau", "n8n", "Zapier"] as const;

export const salesEngagements: readonly MigrationEngagementStep[] = [
  {
    id: "sales-process-audit", number: "01", icon: "assess", title: "Sales process audit",
    problem: "We need to understand where manual work and handoffs occur.",
    description: "Review the sales process, CRM stages, lead handling, and reporting needs to agree practical priorities.",
    bullets: ["Process and handoff review", "CRM workflow and data review", "Prioritized next steps"],
  },
  {
    id: "automation-dashboards-build", number: "02", icon: "migrate", title: "Automation and dashboards build",
    problem: "We have priorities and want them implemented.",
    description: "Build the agreed sales automations and reporting views, then review their behavior with the team.",
    bullets: ["Agreed workflow automation", "Pipeline and revenue dashboards", "Review with sales users"],
  },
  {
    id: "sales-ongoing-optimization", number: "03", icon: "manage", title: "Ongoing optimisation",
    problem: "We want help improving the process after launch.",
    description: "Discuss ongoing support for sales workflow changes, reporting needs, and agreed optimisation priorities.",
    bullets: ["Workflow and reporting review", "Feedback and issue follow-up", "Agreed optimisation priorities"],
  },
];

export const salesFaqs = [
  { question: "Which sales tasks can be automated?", answer: "Tasks such as lead routing, scoring, follow-up sequences, reminders, deal-stage updates, and quote or proposal workflows may be automated when the rules and ownership are clear. We review your current process and CRM before deciding which steps are suitable." },
  { question: "What is lead scoring?", answer: "Lead scoring is a way to organize lead attributes and activity signals into a priority measure for follow-up. Useful scoring depends on agreed criteria, available data, and regular review with the sales team." },
  { question: "How accurate can sales forecasts be?", answer: "Forecast quality depends on data completeness, consistent sales stages, clear definitions, and how teams update expected outcomes. We help make those assumptions visible and review forecasts against actual outcomes; no process can guarantee a particular level of accuracy." },
  { question: "Will automation work with our current CRM?", answer: "That depends on your CRM, configuration, available integrations, access, and the workflow you want to automate. We review those constraints before recommending an implementation approach." },
  { question: "Which sales KPIs should we track?", answer: "Useful measures depend on your sales model and decisions. Teams commonly review agreed measures such as pipeline movement, lead response, conversion, deal aging, forecast changes, and revenue, with clear definitions and context." },
  { question: "How much does sales automation cost?", answer: "Cost depends on the number and complexity of workflows, CRM setup, integrations, reporting scope, data readiness, and ongoing support. We clarify requirements and responsibilities before scoping the work." },
] as const;

export const aiSalesCapabilities = [
  { name: "AI lead scoring", description: "Help sales teams identify and prioritize leads using the customer and engagement signals already available in your CRM.", focus: [
    { title: "Prioritized lead lists", description: "Order leads using available signals, so reps can see where to start." },
    { title: "Consistent qualification", description: "Apply the same criteria across leads to support more consistent qualification." },
    { title: "Reviewable priorities", description: "Make it clear why a lead is prioritized, so reps can review it and act." },
  ], control: "Reps and managers decide how to act on a lead. Scoring is a guide, not a verdict.", cta: "Curious how agents fit into your sales workflow?" },
  { name: "AI-drafted follow-ups", description: "Prepare follow-up messages from account and deal context, ready for a rep to review.", focus: [
    { title: "Context-aware drafts", description: "Draft messages using the account and deal context already in your CRM." },
    { title: "Faster responses", description: "Help reps respond sooner after a call, meeting, or other sales activity." },
    { title: "Stage-appropriate tone", description: "Adapt each draft to the stage and situation of the opportunity." },
  ], control: "Reps review and approve each message before anything is sent.", cta: "Want help with follow-ups that reps can review?" },
  { name: "Deal risk alerts", description: "Highlight signals in an active deal that may need attention, with the context to review them.", focus: [
    { title: "Early signals", description: "Highlight changes that may indicate risk, such as stalled progress or a gap in activity." },
    { title: "Deals needing attention", description: "Help teams spot sooner which opportunities deserve a closer look." },
    { title: "Context in one place", description: "Bring relevant deal context together, so the review starts with the full picture." },
  ], control: "Alerts prompt a conversation. The team decides what to do about the deal.", cta: "Want earlier visibility into deals that need attention?" },
] as const;
