import type { MigrationEngagementStep } from "@/components/service-sub/migration-engagement-options.data";
import type { SubSection } from "@/content/cloud-sub-services/pages";

export const biConsultingService = {
  key: "bi-consulting",
  slug: "bi-consulting",
  name: "BI Consulting",
  keyword: "BI consulting services",
  seoTitle: "BI Consulting Services | Vyntics",
  seoDescription: "Vyntics provides BI consulting services for Power BI, Tableau, and Amazon QuickSight, including selection, implementation, migration, performance, training, and support.",
  hero: {
    title: "BI consulting services for reporting your teams can rely on",
    introduction: "We help businesses choose, implement, improve, migrate, and support Power BI, Tableau, and Amazon QuickSight environments around their reporting needs and users.",
    outcome: "Build a BI environment your team can use and maintain.",
    cta: "Discuss your BI environment",
    expectedImage: "/images/services/our-services-section/bi-consulting.png",
    imageAlt: "Presenter reviewing reporting charts on a tablet beside a whiteboard",
  },
} as const;

export const biConsultingSections: {
  signs: SubSection;
  powerBi: SubSection;
  tableau: SubSection;
  quickSight: SubSection;
  services: SubSection;
  results: SubSection;
  relatedServices: SubSection;
} = {
  signs: {
    id: "bi-consulting-signs",
    title: "Signs you need BI consulting",
    introduction: "BI problems often become visible through low adoption, unreliable reporting, rising licence costs, or a lack of internal ownership.",
    items: [
      { title: "A BI tool nobody uses", description: "Reports exist, but they do not fit how people review information or make decisions." },
      { title: "Reports load slowly, and scheduled refreshes sometimes fail", description: "Data models and refresh schedules may be poorly designed, so reports struggle as data and users grow." },
      { title: "BI license costs keep growing, with little to show for them", description: "The current licensing setup may no longer match the people, capacity, and features the business needs." },
      { title: "Requests to improve reports wait for the one person who knows how", description: "Your team may need BI consulting support to choose, build and maintain the right tools." },
    ],
  },
  powerBi: {
    id: "power-bi-consulting",
    title: "Power BI consulting",
    introduction: "Power BI consulting for businesses setting up, improving, or moving reporting into the Microsoft BI environment.",
    items: [
      { title: "Setup", description: "Set up the Power BI environment around your data sources, users, workspaces, and reporting needs." },
      { title: "Data modelling", description: "Shape a clear data model with agreed definitions, so reports use measures your teams can trust." },
      { title: "DAX", description: "Develop and review DAX measures and calculations for the business logic your reports depend on." },
      { title: "Power BI Service and licensing", description: "Plan workspaces, sharing, refresh, access, and the licensing that fits your users and capacity." },
      { title: "Migration to Power BI", description: "Move existing reports from Excel or another BI tool, validating results with your team along the way." },
    ],
  },
  tableau: {
    id: "tableau-consulting",
    title: "Tableau consulting",
    introduction: "Tableau consulting for businesses that need help establishing, developing, or improving their Tableau reporting environment.",
    items: [
      { title: "Setup", description: "Establish a Tableau environment around your data connections, users, and the way teams will publish and share work." },
      { title: "Dashboard development", description: "Build interactive dashboards and visual analysis around the questions each audience needs to answer." },
      { title: "Tableau Server and Tableau Cloud", description: "Plan, configure, and support Tableau Server or Tableau Cloud, including access, content organization, and refresh." },
      { title: "Performance tuning", description: "Review slow workbooks, data sources, and extracts, then improve how dashboards load and respond." },
    ],
  },
  quickSight: {
    id: "amazon-quicksight-consulting",
    title: "Amazon QuickSight consulting",
    introduction: "Amazon QuickSight consulting for AWS users planning a BI setup or embedded analytics experience.",
    items: [
      { title: "Setup on AWS", description: "Set up Amazon QuickSight alongside your AWS data sources, with access and permissions planned from the start." },
      { title: "Embedded analytics", description: "Place dashboards inside your own applications or portals, with access suited to their users." },
      { title: "Cost-effective BI for AWS users", description: "Shape a QuickSight setup around how many people use it and how, so ongoing costs stay easy to understand." },
    ],
  },
  services: {
    id: "our-bi-services",
    title: "Our BI services",
    introduction: "Our BI implementation services cover the decisions and delivery work needed to establish or improve a maintainable reporting environment.",
    items: [
      { title: "Tool selection", description: "Compare Power BI, Tableau, and Amazon QuickSight against your reporting needs, existing environment, users, and ownership model." },
      { title: "Implementation", description: "Set up the selected BI platform, reporting structure, access, models, and publishing process around an agreed scope." },
      { title: "Migration between tools", description: "Review existing reports and move agreed reporting requirements to the selected BI platform with validation." },
      { title: "Performance tuning", description: "Investigate slow reports, models, calculations, refresh behavior, and platform configuration before making changes." },
      { title: "Training and adoption", description: "Help report creators, owners, and users understand how to work with the BI environment and its reporting process." },
    ],
  },
  results: {
    id: "bi-consulting-results",
    title: "What a well-supported BI environment can improve",
    introduction: "The result depends on your starting point, platform, reports, licensing, and users. We review practical changes without assuming a fixed outcome.",
    items: [
      { title: "User adoption", description: "Make reports easier to understand and connect them more closely to the decisions each audience needs to make." },
      { title: "Report speed", description: "Review models, calculations, refresh behavior, and report design to identify the causes of slow reporting." },
      { title: "Licence savings", description: "Compare licence assignments and platform choices with actual user and reporting requirements before recommending changes." },
    ],
  },
  relatedServices: {
    id: "bi-consulting-related-services",
    title: "Connect BI consulting with reporting and trusted data",
    introduction: "A useful BI environment depends on reporting that serves its audience and data that teams can understand and maintain.",
    items: [
      { title: "Dashboards & Executive Reporting", description: "Turn agreed measures into focused dashboards and leadership reporting for the people making decisions.", href: "/services/analytics-bi/dashboards-executive-reporting", linkLabel: "Explore Dashboards & Executive Reporting" },
      { title: "Data Warehousing & Lakehouse", description: "Create a governed data foundation for reusable analytics, reporting, and shared business definitions.", href: "/services/data-engineering/data-warehousing-lakehouse", linkLabel: "Explore Data Warehousing & Lakehouse" },
    ],
  },
};

export const biProcess = [
  { title: "Assess", visual: "Current BI environment", description: "Review the current tools, reports, models, users, licensing, performance, and support needs." },
  { title: "Choose tool", visual: "Platform fit", description: "Compare suitable BI platforms against the reporting scope, existing systems, users, and ownership requirements." },
  { title: "Implement", visual: "BI setup and reports", description: "Set up the agreed environment and implement or migrate the reporting scope with review and validation." },
  { title: "Train", visual: "Creators and users", description: "Help the people who build, own, and use reports understand the platform and publishing process." },
  { title: "Support", visual: "Ongoing BI operation", description: "Agree how report issues, platform changes, performance, licensing, and adoption will be reviewed after launch." },
] as const;

export const biEngagements: readonly MigrationEngagementStep[] = [
  {
    id: "bi-health-check", number: "01", icon: "assess", title: "BI health check",
    problem: "We have a BI environment, but adoption, performance, cost, or ownership is unclear.",
    description: "Review the current platform, reports, models, users, licensing, and support gaps before deciding what to change.",
    bullets: ["Platform and report review", "Performance and licensing findings", "Prioritized next steps"],
  },
  {
    id: "bi-implementation", number: "02", icon: "migrate", title: "Implementation",
    problem: "We need to choose, set up, improve, or migrate a BI platform.",
    description: "Deliver the agreed BI environment and reporting scope with validation, documentation, and team review.",
    bullets: ["Agreed platform setup", "Models, reports, and access", "Validation and team handover"],
  },
  {
    id: "ongoing-bi-support", number: "03", icon: "manage", title: "Ongoing BI support",
    problem: "We need help keeping our BI environment useful after launch.",
    description: "Discuss ongoing support for reports, performance, platform changes, licensing, and user adoption.",
    bullets: ["Report and refresh support", "Performance and platform review", "Training and adoption follow-up"],
  },
];

export const biFaqs = [
  { question: "Should we choose Power BI, Tableau or QuickSight?", answer: "The right choice depends on your existing systems, reporting requirements, users, licensing needs, embedded analytics plans, and the skills available to operate the platform. We compare those requirements before recommending a tool." },
  { question: "How much does Power BI cost?", answer: "Power BI cost depends on the licences, capacity, sharing model, and features your users require. Microsoft can change its plans and pricing, so we review the current options against your user and reporting requirements rather than quoting a universal cost." },
  { question: "Can you migrate our reports from Excel or another BI tool?", answer: "We can review existing spreadsheets, reports, calculations, data sources, and user needs, then scope a migration to the selected BI platform. The work depends on the condition of the source reports and which behavior needs to be preserved." },
  { question: "Do you train our team to use the BI tool?", answer: "Training and adoption are part of the defined BI consulting scope. We tailor enablement to the people who create reports, manage the environment, own business definitions, or use the published reporting." },
  { question: "Why are our Power BI reports slow?", answer: "Slow reports can be related to data models, DAX calculations, source queries, refresh design, visual complexity, capacity, or the amount of data being processed. We investigate the report and its environment before recommending changes." },
  { question: "Can you support our BI setup after launch?", answer: "We can discuss ongoing BI support for report issues, refreshes, performance, platform changes, licensing, and adoption. The support scope, responsibilities, and response expectations are agreed before the engagement starts." },
] as const;

export const biToolComparison = {
  tools: ["Power BI", "Tableau", "Amazon QuickSight"],
  rows: [
    { label: "Best suited for", cells: ["Organizations already using Microsoft tools and services.", "Teams that want visual exploration and interactive analysis.", "AWS-centric environments with data already in AWS."] },
    { label: "Core strength", cells: ["Enterprise reporting and KPI dashboards built on a strong data model.", "Flexible, visual dashboards for exploring data.", "AWS-native analytics that connect to AWS data services."] },
    { label: "Data modelling", cells: ["Strong modelling capabilities, including DAX measures.", "Models data for analysis, often alongside a prepared warehouse or data layer.", "Works from datasets connected to AWS data sources."] },
    { label: "Dashboarding & visual analysis", cells: ["Interactive reports and KPI dashboards for business users.", "Strong dashboard development and visual analysis.", "Interactive dashboards delivered within the AWS environment."] },
    { label: "Cloud / ecosystem fit", cells: ["Power BI Service within the Microsoft ecosystem, with licensing to plan for.", "Tableau Cloud or Tableau Server across a range of data platforms.", "AWS-native, and often considered as a cost-conscious BI option within AWS."] },
    { label: "Embedded analytics", cells: ["Available through Power BI embedding options, with licensing and capacity to plan.", "Available through Tableau embedding options, depending on deployment and licensing.", "A core option for placing dashboards inside your own applications."] },
    { label: "Typical consulting needs", cells: ["Setup, data modelling, DAX, Power BI Service and licensing, and migration to Power BI.", "Setup, dashboard development, Tableau Server and Tableau Cloud, and performance tuning.", "Setup on AWS, embedded analytics, and cost-effective BI for AWS users."] },
  ],
} as const;
