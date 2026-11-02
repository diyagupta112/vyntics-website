/*
  Simple-English answers for each service, used by the chatbot instead of the longer
  website copy. Keys are sub-service slugs from the service sitemap.
*/

export type SimpleService = {
  overview: string;
  deliver: readonly string[];
  steps: readonly string[];
  outcomes: readonly string[];
};

export const simpleServices: Record<string, SimpleService> = {
  "rag-knowledge-assistants": {
    overview: "We build an AI assistant that answers questions using your own documents and data. Every answer shows the source, so your team can trust it.",
    deliver: [
      "Connects to your files, wikis and databases",
      "Finds the right information quickly",
      "Shows the source file for every answer",
      "Tracks speed, accuracy and user feedback",
    ],
    steps: [
      "Choose the data sources and who can see what",
      "Clean the data and tune the search",
      "Test that answers stay true to the sources",
      "Launch, keep the data in sync and improve from feedback",
    ],
    outcomes: [
      "Answers based on approved sources",
      "Clear source links with every answer",
      "Access rules are respected",
      "The assistant says when it is not sure",
    ],
  },
  "ai-agents": {
    overview: "We build AI agents that do tasks for you across your tools, like updating a record or sending a follow-up. Important steps go to a person for approval first.",
    deliver: [
      "Connects safely to your CRM, databases and other systems",
      "Plans multi-step tasks and follows them",
      "Asks a person to approve risky actions",
      "Keeps a full record of what the agent did",
    ],
    steps: [
      "Pick one process and define what the agent may do",
      "Set the rules, access and approval points",
      "Test it with bad data, errors and misuse",
      "Roll it out slowly and give it more freedom as it proves itself",
    ],
    outcomes: [
      "Tasks done across your existing tools",
      "People approve the important steps",
      "A full record you can review",
      "Clear handling when something goes wrong",
    ],
  },
  "intelligent-automation": {
    overview: "We turn documents like PDFs, scans and emails into clean data, and automate the repeated steps around them. A person checks anything that looks unsure.",
    deliver: [
      "Collects documents from email, storage or APIs and sorts them",
      "Pulls out the fields and tables you need",
      "Checks the data against your business rules",
      "A simple review screen where people fix mistakes",
    ],
    steps: [
      "Review your document types and the data you need",
      "Set accuracy targets using sample documents",
      "Build the extraction and checking",
      "Send clean data to your systems and learn from corrections",
    ],
    outcomes: [
      "Clean data from messy files",
      "Unsure items go to a person",
      "Every correction can be traced",
      "Less manual checking",
    ],
  },
  "data-pipelines-integration": {
    overview: "We build automatic data flows that move data from your systems to the place where you analyze it. They keep running, recover from failures, and alert you when something breaks.",
    deliver: [
      "Collects data from databases, apps, files and APIs",
      "Handles both scheduled and real-time data",
      "Retries failed runs and fills in missed data",
      "Monitors freshness, failures and run time",
    ],
    steps: [
      "List your data sources and who uses the data",
      "Agree how data moves, how often, and how to recover",
      "Build it so a run can safely be repeated",
      "Watch it in production and keep improving it",
    ],
    outcomes: [
      "Data arrives on time",
      "Failures can be fixed and replayed",
      "Clear owners for each pipeline",
      "Less manual data work",
    ],
  },
  "data-warehousing-lakehouse": {
    overview: "We set up a cloud data warehouse that puts your scattered data in one organized place, ready for reports and analysis.",
    deliver: [
      "A clear design for storing and processing data",
      "Data models that match how your business measures results",
      "Access rules and protection for sensitive data",
      "Faster queries and lower running cost",
    ],
    steps: [
      "Start with the reports and users it must support",
      "Organize data into raw, clean and business-ready layers",
      "Move data over in stages and check results against the old system",
      "Tune speed and cost from real usage",
    ],
    outcomes: [
      "One trusted source of truth",
      "Faster, more consistent reports",
      "Controlled access to sensitive data",
      "Clear view of cost and speed",
    ],
  },
  "data-quality-governance": {
    overview: "We add checks that catch bad data early. Each check has an owner and a clear plan for what to do when it fails.",
    deliver: [
      "Rules for missing, wrong or duplicate data",
      "Alerts for late loads and odd record counts",
      "Matching totals between your source systems and reports",
      "A process that sends problems to the right owner",
    ],
    steps: [
      "Find the data that matters most",
      "Agree on targets and owners",
      "Run checks automatically inside your pipelines",
      "Fix the cause of repeated problems",
    ],
    outcomes: [
      "Bad data is found earlier",
      "Clear ownership of problems",
      "Freshness and completeness you can measure",
      "Reports and models you can trust",
    ],
  },
  "cloud-architecture-migration": {
    overview: "We design a safe, well-monitored cloud setup and move your apps and data to it. We test the switch and plan how to go back if needed.",
    deliver: [
      "A target design for your cloud setup",
      "A migration plan, with testing, cutover and rollback",
      "Handover with monitoring, backups, guides and training",
    ],
    steps: [
      "Review your current systems, risks and costs",
      "Design a setup that fits your needs and budget",
      "Automate the setup and test recovery",
      "Run it, measure it and keep improving",
    ],
    outcomes: [
      "A cloud setup your team understands",
      "A tested move with a way back",
      "Clear view of cost and reliability",
    ],
  },
  "devops-reliability": {
    overview: "We set up automatic, safe ways to release software and watch it in production, so problems are caught early and fixed fast.",
    deliver: [
      "Infrastructure as code and automatic release pipelines",
      "Monitoring, logs and alerts tied to user impact",
      "Reliability goals, guides and a review process after incidents",
    ],
    steps: [
      "Review your systems, risks and who owns what",
      "Design the target setup",
      "Automate releases and test failure recovery",
      "Measure reliability and cost, then improve",
    ],
    outcomes: [
      "Changes that are easy to review and undo",
      "Problems seen quickly",
      "Less manual work in production",
    ],
  },
  "cloud-cost-optimization": {
    overview: "We show where your cloud money goes and make safe changes to lower it, without hurting reliability.",
    deliver: [
      "A cost baseline by service, team and environment",
      "A prioritized list of savings, like right-sizing and scheduling",
      "Budgets, alerts and tagging to keep costs under control",
    ],
    steps: [
      "Review your systems, risks and costs",
      "Pick changes that fit your reliability and budget needs",
      "Apply and test the changes",
      "Track spend and keep improving",
    ],
    outcomes: [
      "Cloud spend you can explain",
      "Savings from safe changes",
      "Controls that keep costs down",
    ],
  },
  "crm-implementation-integration": {
    overview: "We set up your CRM around how your team really works, move your data in cleanly, and connect it to your website, marketing, support and finance tools.",
    deliver: [
      "A plan for stages, records, permissions and ownership",
      "Setup, clean data migration, testing and training",
      "Connections between systems that are monitored and checked",
    ],
    steps: [
      "Map the customer journey and who does what",
      "Design the records, fields, permissions and workflows",
      "Build it, move the data and test full journeys",
      "Train users and improve from real use",
    ],
    outcomes: [
      "A CRM your team will use",
      "Clean, connected data",
      "Clear ownership of each system",
    ],
  },
  "sales-automation-revenue-analytics": {
    overview: "We automate sales steps like lead routing and follow-ups, and build reports on pipeline, conversion and forecasts you can trust.",
    deliver: [
      "Lead scoring, assignment, reminders and approvals",
      "Clear definitions for conversion, win rate, forecast and more",
      "Dashboards and alerts for teams and leaders",
    ],
    steps: [
      "Map the customer journey and handoffs",
      "Design the records, workflows and measures",
      "Build it, connect your tools and test",
      "Train the team and improve from results",
    ],
    outcomes: [
      "Faster follow-up on leads",
      "Reports everyone agrees on",
      "Better visibility of your pipeline",
    ],
  },
  "dashboards-executive-reporting": {
    overview: "We turn your agreed business numbers into clear dashboards and leadership reports that show performance, trends and problems.",
    deliver: [
      "A KPI guide with definitions, owners and targets",
      "Views for executives and for day-to-day teams",
      "Regular refresh, review and sharing of reports",
    ],
    steps: [
      "Decide which questions the reports must answer",
      "Check data quality, owners and definitions",
      "Build the reports and check every key number",
      "Launch, track use and improve",
    ],
    outcomes: [
      "Numbers everyone agrees on",
      "Clear reports for each audience",
      "Reliable, repeatable reporting",
    ],
  },
  "bi-consulting": {
    overview: "We help you choose, set up, fix, move and support your BI tools: Power BI, Tableau and Amazon QuickSight.",
    deliver: [
      "Tool selection: compare the tools for your needs",
      "Implementation: set up the tool, reports and access",
      "Migration: move reports from one tool to another",
      "Performance tuning: fix slow reports",
      "Training so your team can use and maintain it",
    ],
    steps: [
      "Review your current tools, reports and costs",
      "Choose the right tool",
      "Set up or move your reports and check them",
      "Train your team",
      "Agree how to support it after launch",
    ],
    outcomes: [
      "More people using reports",
      "Faster reports",
      "Licence costs that match real use",
    ],
  },
};
