// First-draft copy based on Analytics & BI.pdf and the supplied pillar-page strategy.
// Services, tools, five process stages and six FAQ topics follow the document.

export const analyticsContent = {
  name: "Analytics & BI",
  seoDescription: "Vyntics provides business intelligence services, dashboards, reporting and analytics consulting to help businesses turn data into clearer decisions.",
  hero: {
    eyebrow: "Analytics & BI",
    heading: "Turn your data into better decisions with BI",
    introduction: "Our business intelligence services connect trusted data to dashboards, reporting, and analytics, so teams can review performance and leaders have a clear view of the decisions ahead.",
    primaryLabel: "Discuss your BI needs",
  },
  problems: [
    { title: "Fragmented Reporting", description: "We connect reporting across your business systems, so teams can review the information they need without piecing together separate reports." },
    { title: "Inconsistent Metrics", description: "We define shared KPIs, calculation rules, and data ownership, helping teams work from consistent numbers across dashboards and reports." },
    { title: "Manual Reporting", description: "We connect data sources and automate repeatable reporting steps, with checks and clear refresh schedules instead of repeated manual exports." },
    { title: "Limited Visibility", description: "We build focused executive and operational views, so decision makers can review performance, spot gaps, and ask useful follow-up questions." },
  ],
  problemIntroduction: "From disconnected reports to unclear metrics, we help teams build a reporting setup they can use for everyday decisions.",
  reasons: [
    { title: "Decisions First", description: "We start with the questions your team needs to answer, then shape the metrics, reports, and dashboard views around them.", path: "M4 9 12 4l8 5-8 5-8-5Zm0 6 8 5 8-5M4 20l8 5 8-5" },
    { title: "Consistent Foundations", description: "Connect existing data systems with shared KPI definitions and checks, so reporting has a clear, maintainable foundation.", path: "M4 6h6v6H4zM14 16h6v6h-6zM16 6h5v5M21 6l-9 9" },
    { title: "Clear Visualization", description: "Focused dashboard design makes comparisons, trends, and exceptions easier to review without crowding the screen.", path: "M4 20h17M7 16v-4M12 16V8M17 16V4" },
    { title: "Support Beyond Delivery", description: "Connect implementation with training, documentation, and ongoing support as your data sources and reporting needs change.", path: "M20 8a8 8 0 1 0 1 8M20 3v5h-5M8 12l3 3 5-6" },
  ],
  whyIntroduction: "As a business analytics company, we connect your data, reporting, and decisions.",
  whyImage: {
    src: "/images/services/why-choose-analytics.jpg",
    alt: "Vyntics team reviewing analytics and BI reports together around a laptop.",
  },
  services: [
    {
      name: "Dashboards & Executive Reporting",
      href: "/services/analytics-bi/dashboards-executive-reporting",
      image: "/images/services/our-services-section/dashboards-and-analytics.png",
      imageAlt: "Laptop displaying an analytics dashboard with charts and KPI summaries.",
      introduction: "Give leaders and operational teams a clear view of performance. Our data visualization services bring KPI dashboards, executive reporting, and automated reports together around the questions people need to answer.",
      points: ["Custom KPI dashboards", "Real-time dashboard views", "Embedded dashboards in your apps or portals", "Automated weekly and monthly reporting", "Board packs and executive summaries", "Scheduled email reports", "Mobile-friendly reporting views"],
    },
    {
      name: "BI Consulting",
      href: "/services/analytics-bi/bi-consulting",
      image: "/images/services/our-services-section/bi-consulting.png",
      imageAlt: "Presenter reviewing reporting charts on a tablet beside a whiteboard.",
      introduction: "Our analytics consulting services help you choose, set up, or improve your BI approach. We align analytics strategy, architecture, reporting standards, and governance with practical implementation and dashboard design.",
      points: ["BI strategy and tool selection", "Architecture and implementation guidance", "Reporting standards and metric governance", "Dashboard design and performance tuning", "Training and adoption"],
    },
  ],
  platformsIntroduction: "We choose tools for business intelligence solutions around your data, reporting needs, existing systems, and team skills.",
  platforms: [
    { name: "Amazon QuickSight", role: "AWS and embedded BI", description: "For teams using AWS or embedding analytics in their applications, with setup and dashboard delivery." },
    { name: "Power BI", role: "Models and reporting", description: "For connected KPI reporting, with data modeling, DAX, dashboard setup, and Power BI Service guidance." },
    { name: "Tableau", role: "Visual exploration", description: "For interactive dashboards and data exploration, with setup, performance tuning, and publishing support." },
  ],
  approachIntroduction: "Five practical stages, from understanding your reporting needs to supporting the BI solution your team uses.",
  steps: [
    { title: "Discover", visual: "Discover", description: "Review your reporting questions, data sources, current metrics, and the decisions your team needs to make." },
    { title: "Design", visual: "Design", description: "Define KPIs, reporting standards, data models, and dashboard layouts around your users and business priorities." },
    { title: "Build", visual: "Build", description: "Connect data, implement dashboards and reports, and validate calculations, refreshes, and access with your team." },
    { title: "Train", visual: "Train", description: "Help your team use the reports, understand metric definitions, and manage everyday questions and updates." },
    { title: "Support", visual: "Support", description: "Review reporting issues, maintain the BI setup, and refine dashboards as your data and decision needs change." },
  ],
  questions: [
    { question: "What do business intelligence services include?", answer: "Business intelligence services can include KPI definition, data models, dashboards, automated reporting, tool selection, training, and support. We shape the work around your reporting needs, available data, and the decisions your team makes." },
    { question: "What is the difference between BI and data analytics?", answer: "BI usually focuses on consistent reporting and visibility into business performance. Data analytics explores patterns and questions in more depth. The two work together: shared metrics and trusted data support both everyday reporting and further analysis." },
    { question: "How long does it take to set up BI?", answer: "Timing depends on your data quality, source systems, reporting scope, access requirements, and chosen tool. We review those first, then agree a delivery plan that covers data connections, dashboard design, validation, and team training." },
    { question: "How much do BI services cost?", answer: "Cost depends on the number of data sources, reporting complexity, tool licensing, implementation work, and ongoing support. We review your priorities and current setup before defining the scope, so you can assess the proposed work and costs." },
    { question: "Which BI tool is right for our business?", answer: "The right tool depends on your existing systems, reporting needs, user skills, budget, and plans for embedded analytics. We assess Power BI, Tableau, and Amazon QuickSight against those requirements before recommending an approach." },
    { question: "Do we need a data warehouse before setting up BI?", answer: "Not always. A focused reporting setup may use existing data sources directly. A warehouse becomes useful when several systems need consistent history, shared definitions, or more demanding reporting. We assess the data foundation before adding another layer." },
  ],
  faqIntroduction: "Practical answers about business intelligence services, choosing a BI tool, reporting foundations, and delivery scope.",
  caseStudiesIntroduction: "Explore how data analytics services, reporting, and connected systems help teams work from information they can use.",
  nextIntroduction: "Reliable reporting is the next step after Data Engineering. With that foundation in place, AI Solutions can add assistants, agents, and automation around the information your team uses.",
  cta: {
    eyebrow: "Analytics & BI",
    heading: "Make your reporting work for the decisions ahead",
    introduction: "Tell us about your reporting challenges, dashboard requirements, or BI strategy. We can review your data and analytics needs together and identify a practical starting point.",
    submitLabel: "Discuss your BI needs",
  },
  suggestedArticles: ["What Is Business Intelligence", "BI vs Data Analytics", "Building a Data-Driven Culture"],
} as const;

export function isAnalyticsContent(fields: readonly string[]) {
  return fields.some(field => /\b(analytics|business intelligence|bi|dashboard\w*|reporting|visuali[sz]ation|power\s?bi|tableau|quicksight)\b/i.test(field));
}
