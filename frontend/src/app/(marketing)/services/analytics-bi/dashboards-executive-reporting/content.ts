import type { SubSection } from "@/content/cloud-sub-services/pages";
import type { MigrationEngagementStep } from "@/components/service-sub/migration-engagement-options.data";

export const dashboardService = {
  key: "dashboards-executive-reporting",
  slug: "dashboards-executive-reporting",
  name: "Dashboards & Executive Reporting",
  keyword: "dashboard development services",
  seoTitle: "Dashboard Development Services | Vyntics",
  seoDescription: "Vyntics builds custom KPI dashboards, real-time reporting, and automated executive reporting around the decisions your teams need to make.",
  hero: {
    title: "Dashboard development services for clearer decisions",
    introduction: "We help leaders and teams replace hours of manual reporting with focused dashboards and executive reporting built around the questions they need to answer.",
    outcome: "Bring KPIs, trends, and exceptions into a view your team can use.",
    cta: "Discuss your dashboards",
    expectedImage: "/images/services/our-services-section/dashboards-and-analytics.png",
    imageAlt: "Laptop displaying an analytics dashboard with charts and KPI summaries",
  },
} as const;

export const dashboardSections: {
  signs: SubSection;
  dashboardServices: SubSection;
  executiveReporting: SubSection;
  results: SubSection;
  relatedServices: SubSection;
} = {
  signs: {
    id: "dashboard-signs",
    title: "Signs you need better dashboards",
    introduction: "Reporting friction often shows up in how information is prepared, shared, and revisited.",
    items: [
      { title: "Reports built manually in Excel", description: "Recurring views depend on people repeating the same spreadsheet preparation, so the process is hard to reuse or review." },
      { title: "Numbers that arrive days late", description: "Reporting cycles take longer than the decisions they support, so leaders review information after it has changed." },
      { title: "Too many reports nobody reads", description: "Reports have grown without a shared structure, so it is hard to find the view that answers a given question." },
      { title: "Leaders asking for the same data again and again", description: "Key measures are not available in a consistent, shared view, so people ask for them each time they are needed." },
    ],
  },
  dashboardServices: {
    id: "dashboard-development-services",
    title: "Our dashboard development services",
    introduction: "We shape custom dashboard development around agreed KPIs, data access, and the way each audience needs to use the information.",
    items: [
      { title: "Custom KPI dashboards", description: "Bring agreed measures, trends, and exceptions together in a focused view for the people making decisions." },
      { title: "Real-time dashboards", description: "Connect dashboard refresh behavior to the available data sources and the timing your decisions require." },
      { title: "Embedded dashboards", description: "Add reporting views inside your own applications or portals, with access and context suited to their users." },
    ],
  },
  executiveReporting: {
    id: "executive-reporting-services",
    title: "Our executive reporting services",
    introduction: "Make recurring management reporting easier to prepare and review, while keeping the underlying measures clear.",
    items: [
      { title: "Automated weekly and monthly reports", description: "Prepare recurring reports from agreed measures and a reviewable refresh process." },
      { title: "Board packs", description: "Organize leadership reporting around the performance context and decisions that need attention." },
      { title: "Scheduled email reports", description: "Distribute agreed report views on a predictable schedule to the intended audience." },
      { title: "Mobile-friendly views", description: "Present key reporting in a format that remains usable on smaller screens." },
    ],
  },
  results: {
    id: "dashboard-results",
    title: "What better reporting can improve",
    introduction: "We focus on outcomes your team can review over time, without assuming a fixed saving or adoption result.",
    items: [
      { title: "Reporting hours saved", description: "Reduce repeated manual preparation by automating agreed refresh and reporting steps." },
      { title: "Faster decisions", description: "Give decision-makers a more timely view of the measures, changes, and exceptions they need to discuss." },
      { title: "Report adoption", description: "Make reporting more relevant to each audience, then review how teams use it and where it needs to improve." },
    ],
  },
  relatedServices: {
    id: "dashboard-related-services",
    title: "Connect dashboards with trusted data and BI",
    introduction: "Reporting depends on clear business definitions, suitable tools, and data that teams can understand and maintain.",
    items: [
      { title: "BI Consulting", description: "Choose, implement, or improve a BI environment around your models, reports, governance, and users.", href: "/services/analytics-bi/bi-consulting", linkLabel: "Explore BI Consulting" },
      { title: "Data Warehousing & Lakehouse", description: "Create a governed data foundation for reusable analytics and reporting.", href: "/services/data-engineering/data-warehousing-lakehouse", linkLabel: "Explore Data Warehousing" },
    ],
  },
};

export const dashboardProcess = [
  { title: "Define KPIs", visual: "Measures and decisions", description: "Agree the audience, business definitions, owners, and decisions each dashboard or report should support." },
  { title: "Connect data", visual: "Sources and refresh", description: "Review the available data sources, access, quality, and refresh requirements before shaping the reporting model." },
  { title: "Design", visual: "Views for each audience", description: "Organize the information hierarchy, context, and interactions around how people need to review performance." },
  { title: "Build", visual: "Dashboards and reports", description: "Implement the agreed views, then check calculations, refresh behavior, and access with your team." },
  { title: "Train", visual: "Use and ownership", description: "Walk through the reports, their definitions, and the practical ownership needed to keep them useful." },
] as const;

export const dashboardEngagements: readonly MigrationEngagementStep[] = [
  {
    id: "kpi-workshop", number: "01", icon: "assess", title: "KPI workshop",
    problem: "We need alignment on the measures and reporting questions.",
    description: "Clarify the audiences, KPI definitions, sources, and decisions to guide the dashboard scope.",
    bullets: ["Audience and decision needs", "KPI definitions and ownership", "Data source and reporting review"],
  },
  {
    id: "dashboard-build", number: "02", icon: "migrate", title: "Dashboard build",
    problem: "We have a reporting scope and want it implemented.",
    description: "Build and review the agreed dashboard and executive reporting views with your team.",
    bullets: ["Agreed dashboard and report scope", "Calculation and refresh checks", "Review with report users"],
  },
  {
    id: "reporting-support", number: "03", icon: "manage", title: "Ongoing reporting support",
    problem: "We want help keeping reports useful as needs change.",
    description: "Discuss ongoing help with reporting operations, user feedback, and dashboard improvements.",
    bullets: ["Refresh and report issue support", "Review of user feedback", "Agreed reporting improvements"],
  },
];

export const dashboardFaqs = [
  { question: "How long does it take to build a dashboard?", answer: "Timing depends on the number of audiences and views, the state of the source data, KPI definitions, access requirements, and review cycles. A focused dashboard using ready data has a different scope from reporting that needs new data connections or reconciled definitions. We clarify these dependencies before agreeing a delivery plan." },
  { question: "Can dashboards update automatically in real time?", answer: "Dashboards can refresh automatically when the source systems and BI platform support the required refresh pattern. Some sources provide scheduled updates, while others can support more frequent or event-driven updates. We review the data source, platform limits, and business need before setting expectations." },
  { question: "Which KPIs should we track?", answer: "The right KPIs depend on your business goals, operating model, and the decisions each audience needs to make. We work with your team to define measures, calculation rules, owners, targets, and useful context before building the dashboard." },
  { question: "Can you embed dashboards in our own app or portal?", answer: "Embedded reporting may be appropriate when the BI platform, application, identity setup, licensing, and access model support it. We review those requirements and the user experience before recommending an embedding approach." },
  { question: "Can we view dashboards on mobile?", answer: "Yes, dashboard layouts can be designed for mobile use where the selected platform and report design support it. We prioritize the measures and interactions people need on smaller screens and check the result with your intended users." },
  { question: "How much does dashboard development cost?", answer: "Cost depends on the reporting scope, data readiness, number of sources and views, integration or embedding needs, and the level of ongoing support. We clarify the requirements and responsibilities first, then scope the work with you." },
] as const;

export const dashboardTeams = [
  { name: "Sales", description: "Review pipeline movement, conversion by stage, forecast context, and activity against agreed targets.", focus: [{ title: "Pipeline visibility", description: "Follow how opportunities move between stages and see where they are slowing down." }, { title: "Conversion performance", description: "Compare conversion from one stage to the next to understand where prospects drop off." }, { title: "Forecast context", description: "Place pipeline activity next to agreed targets for clearer sales planning." }], cta: "Need a clearer view of your sales pipeline?" },
  { name: "Finance", description: "Bring revenue, margin, cash flow, and budget variance into a consistent management reporting view.", focus: [{ title: "Revenue and margin", description: "See income and margin side by side, using definitions finance has agreed." }, { title: "Cash flow", description: "Keep cash movement in view alongside the rest of the management picture." }, { title: "Budget variance", description: "Compare actual results with budget to see where the differences sit." }], cta: "Need reporting your finance team can rely on?" },
  { name: "Operations", description: "Follow throughput, service levels, backlogs, and exceptions that need operational attention.", focus: [{ title: "Throughput", description: "Follow how much work moves through each process and where it stalls." }, { title: "Service levels", description: "Check performance against the service levels the team has agreed." }, { title: "Backlogs and exceptions", description: "Surface queues and exceptions that need someone's attention." }], cta: "Want better visibility into operational performance?" },
  { name: "Marketing", description: "Connect campaign activity, channel performance, lead flow, and outcomes using shared definitions.", focus: [{ title: "Campaign performance", description: "See how each campaign is progressing against its agreed goals." }, { title: "Channel performance", description: "Compare channels using the same definitions to see where activity is working." }, { title: "Lead flow and outcomes", description: "Follow leads from first activity through to the outcomes the business tracks." }], cta: "Need a clearer view of campaign performance?" },
  { name: "Leadership", description: "See a concise view of business KPIs, trends, risks, and areas that require a decision.", focus: [{ title: "Business KPIs", description: "Keep the measures leaders have agreed on together in one concise view." }, { title: "Trends and risks", description: "Spot changes over time and the risks that deserve discussion." }, { title: "Decision support", description: "Highlight where a decision is needed, with the context to make it." }], cta: "Need a sharper view of the numbers that matter?" },
] as const;
