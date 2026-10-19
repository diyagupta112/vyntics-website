export type CloudSubPageKey = "migration" | "devops" | "cost";
export type SubCard = { title: string; description: string; href?: string; linkLabel?: string };
export type SubSection = { id: string; title: string; introduction: string; items: readonly SubCard[] };
export type CloudSubPage = {
  key: CloudSubPageKey; slug: string; name: string; keyword: string;
  seoTitle: string; seoDescription: string;
  hero: { title: string; introduction: string; outcome: string; cta: string; expectedImage: string; imageAlt: string };
  signs: SubSection; offerings: readonly SubSection[];
  process: { title: string; introduction: string; steps: readonly { title: string; visual: string; description: string }[] };
  diagram?: { type: "migration" | "pipeline"; title: string; caption: string };
  platforms?: { title: string; introduction: string; items: readonly { name: string; role: string; description: string }[] };
  tools?: readonly string[];
  results: SubSection; engagements: SubSection;
  faqs: readonly { question: string; answer: string }[];
  related: SubSection;
  contact: { title: string; introduction: string; submitLabel: string };
};

const migrationPath = "/services/cloud-foundations/cloud-architecture-migration";
const devopsPath = "/services/cloud-foundations/devops-reliability";
const costPath = "/services/cloud-foundations/cloud-cost-optimization";

export const cloudSubPages: Record<CloudSubPageKey, CloudSubPage> = {
  migration: {
    key: "migration", slug: "cloud-architecture-migration", name: "Cloud Architecture & Migration", keyword: "cloud migration services",
    seoTitle: "Cloud Migration Services | Vyntics",
    seoDescription: "Plan your cloud move with Vyntics cloud migration services. Assess workloads, design architecture, migrate applications, and validate the result.",
    hero: {
      title: "Cloud migration services for your next move",
      introduction: "Our cloud migration services help you move applications and data with a clear cloud migration strategy, tested cutover steps, and an operating plan your team can use.",
      outcome: "Move with a clear plan and a tested path to production.", cta: "Discuss your cloud migration",
      expectedImage: "/image/services/cloud-migration-hero.webp", imageAlt: "Cloud architecture and workload migration planning",
    },
    signs: {
      id: "migration-signs", title: "Cloud problems often show up before you know the cause.",
      introduction: "The signs are usually visible in day-to-day operations. We help identify what is behind them and what needs to change.",
      items: [
        { title: "Applications are becoming slower or less reliable", description: "Ageing infrastructure may be reaching its performance or lifecycle limits." },
        { title: "Systems struggle when workloads increase", description: "The current infrastructure may not be designed to scale efficiently with changing demand." },
        { title: "Your team spends too much time maintaining infrastructure", description: "Manual operations and legacy environments may be increasing maintenance effort and operational cost." },
        { title: "Security issues keep surfacing across the environment", description: "Gaps in access controls, patching, monitoring, or network design may be exposing the environment to unnecessary risk." },
      ],
    },
    offerings: [
      { id: "architecture-services", title: "Our cloud architecture services", introduction: "Our cloud architecture consulting starts with your workloads, dependencies, and ownership needs. We document the choices your team and cloud solution architect need to review.", items: [
        { title: "Well-architected design", description: "We map application boundaries, traffic, data flows, and service requirements before choosing compute, storage, and managed services." },
        { title: "Landing zones", description: "We define the account or subscription structure, environment separation, identity controls, and policies that support consistent deployment." },
        { title: "Security and network design", description: "We plan private connectivity, access boundaries, encryption, and network segmentation around the systems your workloads need to reach." },
        { title: "High availability and disaster recovery", description: "We design redundancy, backup, and recovery options against agreed business requirements, then identify what needs to be tested." },
      ] },
      { id: "migration-services", title: "Our cloud migration services", introduction: "We select a migration approach for each workload. The right choice depends on application constraints, risk, and the changes your team is ready to own.", items: [
        { title: "Rehost: lift and shift", description: "Move a workload with limited application changes when a straightforward infrastructure move is appropriate." },
        { title: "Replatform", description: "Adjust selected platform components, such as a database or application runtime, while keeping most application behavior intact." },
        { title: "Refactor", description: "Change application architecture where the business case supports the additional development, testing, and operational work." },
        { title: "Database and application migration", description: "Plan data transfer, dependency sequencing, validation, cutover, and rollback together so applications and their data move coherently." },
      ] },
    ],
    process: { title: "Our migration process", introduction: "We turn your cloud migration strategy into reviewable stages, with acceptance checks before workloads move into production.", steps: [
      { title: "Assess", visual: "Workloads and dependencies", description: "We inventory workloads, data, dependencies, security requirements, and operating constraints." },
      { title: "Plan", visual: "Architecture and cutover", description: "We define the target architecture, migration sequence, acceptance checks, and rollback approach." },
      { title: "Pilot", visual: "A representative workload", description: "We test the approach on a representative workload and use the findings to refine the plan." },
      { title: "Migrate", visual: "Controlled workload moves", description: "We move applications and data in agreed groups while tracking issues and cutover decisions." },
      { title: "Validate", visual: "Data and service checks", description: "We check data integrity, application behavior, access, performance, backups, and recovery readiness." },
      { title: "Optimise", visual: "Operate and improve", description: "We review resource usage, monitoring, cost, and operating documentation after the move." },
    ] },
    diagram: { type: "migration", title: "Sample migration architecture", caption: "A typical migration moves on-premises servers, a database, and file storage to cloud application services behind a load balancer, with a managed database and cloud storage. This is an illustrative starting point, not a design for your environment." },
    platforms: { title: "Cloud platforms for your migration", introduction: "We compare the fit with your existing systems, data requirements, team skills, and operating model.", items: [
      { name: "AWS", role: "Workload migration", description: "AWS migration services typically involve workload discovery, target account and network planning, and a suitable compute and database destination. We plan validation and operational ownership alongside the move." },
      { name: "Azure", role: "Connected Microsoft environments", description: "Azure migration services typically include readiness assessment, subscription and identity planning, and application or database migration. We review dependencies on existing Microsoft systems before choosing a destination." },
      { name: "Google Cloud", role: "Applications and data", description: "A move to Google Cloud starts with workload discovery and dependency assessment. We compare infrastructure and managed-service options, then plan the data transfer and acceptance checks." },
    ] },
    results: { id: "migration-benefits", title: "What a well-planned migration can improve", introduction: "The benefits depend on your starting environment and the decisions made during the move. We review these areas against your requirements with your team.", items: [
      { title: "Cost visibility", description: "Connect resource choices and usage to operating costs, including the cost of maintaining the new environment." },
      { title: "Scalability", description: "Choose capacity and scaling options that can respond to demand without relying only on hardware purchases." },
      { title: "Security", description: "Make access, network boundaries, patching responsibilities, and recovery procedures explicit and reviewable." },
      { title: "Speed of change", description: "Use repeatable environment setup and clearer operating documentation to make infrastructure changes easier to manage." },
    ] },
    engagements: { id: "migration-engagements", title: "Choose the right starting point", introduction: "We agree on scope, access, responsibilities, and acceptance criteria before delivery starts.", items: [
      { title: "Migration assessment", description: "Review the current environment, dependencies, risks, and destination options before committing to a migration plan." },
      { title: "Full migration", description: "Work through architecture, planning, pilot, migration, validation, and the agreed handoff as one scoped engagement." },
      { title: "Ongoing management", description: "Discuss monitoring, maintenance, incident handling, and improvement responsibilities for the migrated environment." },
    ] },
    faqs: [
      { question: "How long does a cloud migration take?", answer: "A migration typically moves through discovery, planning, testing, and staged cutover. The schedule depends on workload count, data volume, dependencies, testing needs, and available change windows. We assess those factors before proposing a delivery plan." },
      { question: "How much does cloud migration cost?", answer: "Costs typically depend on assessment effort, application changes, data transfer, testing, and the target cloud services. Running old and new environments together can also affect the budget during the move. We separate delivery scope from ongoing cloud operating costs when discussing an engagement." },
      { question: "Will there be downtime during migration?", answer: "Some workloads need a cutover window, while others can support a staged transition. The practical approach depends on data consistency, application design, and the systems connected to it. We plan the change window and rollback steps rather than promising a migration without downtime." },
      { question: "How do you keep our data safe during migration?", answer: "We plan access controls, encrypted transfer, backups, and validation around your data requirements. Permissions should be limited to the people and systems involved in the move. We agree on checks for data integrity and recovery before cutover." },
      { question: "What is the difference between rehosting, replatforming and refactoring?", answer: "Rehosting moves a workload with limited application changes. Replatforming changes selected platform components while keeping much of the application intact. Refactoring changes the application architecture and typically requires more development and testing." },
      { question: "Should we choose AWS, Azure or Google Cloud?", answer: "The choice depends on your applications, existing systems, skills, security requirements, and cost model. There is no single best platform for every workload. We compare suitable options against the requirements you need to meet." },
    ],
    related: { id: "migration-related", title: "Keep building your cloud foundation", introduction: "Migration is one part of an operating environment. Explore the services that support what happens after the move.", items: [
      { title: "DevOps & Reliability", description: "Build repeatable releases and an operating view of the migrated services.", href: devopsPath, linkLabel: "Explore DevOps & Reliability" },
      { title: "Cloud Cost Optimization", description: "Review resource usage and cloud spend after your workloads settle into their new environment.", href: costPath, linkLabel: "Explore Cloud Cost Optimization" },
      { title: "Data Warehousing & Lakehouse", description: "Plan a governed data foundation for reporting and analytics after migration.", href: "/services/data-engineering/data-warehousing-lakehouse", linkLabel: "Explore Data Warehousing & Lakehouse" },
    ] },
    contact: { title: "Plan your next cloud move", introduction: "Tell us which applications and data you want to move, what is holding the project back, and the constraints we should understand. We can discuss a practical assessment and migration scope.", submitLabel: "Discuss your cloud migration" },
  },
  devops: {
    key: "devops", slug: "devops-reliability", name: "DevOps & Reliability", keyword: "DevOps consulting services",
    seoTitle: "DevOps Consulting Services | Vyntics", seoDescription: "Vyntics DevOps consulting services help you improve CI/CD pipelines, infrastructure as code, monitoring, and production reliability.",
    hero: { title: "DevOps consulting services for reliable releases", introduction: "Our DevOps consulting services help your team make deployments repeatable, see production issues sooner, and recover with clearer operating procedures.", outcome: "Release faster, break less", cta: "Get a free DevOps assessment", expectedImage: "/images/services/our-services-section/devops-and-reliability-2.png", imageAlt: "Developer working with code and system monitoring on two screens" },
    signs: { id: "devops-signs", title: "Signs you need DevOps", introduction: "Repeated release and reliability problems make it harder to deliver changes with confidence. These signals help show where a more consistent approach can help.", items: [
      { title: "Slow manual deployments", description: "Releases depend on remembered commands, individual access, or a long sequence of manual checks." },
      { title: "Frequent outages", description: "Changes repeatedly cause incidents, and the team spends more time restoring service than addressing the underlying causes." },
      { title: "No visibility into failures", description: "Logs, metrics, and alerts are missing or scattered, so it is difficult to understand where a problem started." },
      { title: "Environments that do not match", description: "Configuration differences between development, testing, and production make release behavior hard to predict." },
    ] },
    offerings: [
      { id: "devops-services", title: "Our DevOps services", introduction: "Our CI/CD pipeline services connect code changes, checks, and deployment decisions. We use DevOps automation where it reduces repeated work and keeps the process understandable.", items: [
        { title: "CI/CD pipelines", description: "We build automated build, test, and deployment steps with approval gates, release records, and a rollback approach suited to your applications." },
        { title: "Infrastructure as code", description: "We use Terraform where appropriate to define infrastructure in version-controlled files, review changes, and make environments more repeatable." },
        { title: "Containers and Kubernetes", description: "We review packaging, deployment, and scaling needs before introducing orchestration. Our Kubernetes consulting focuses on a setup your team can operate." },
        { title: "DevSecOps", description: "We include dependency checks, secret handling, access controls, and security review points in the delivery workflow rather than leaving them until release." },
      ] },
      { id: "reliability-services", title: "Our reliability services", introduction: "Our site reliability engineering services focus on the health of the service your users depend on. We agree on useful signals, response responsibilities, and recovery expectations.", items: [
        { title: "Monitoring and alerting", description: "Our cloud monitoring services connect service health signals with alerts that tell the right person what needs attention." },
        { title: "Logging", description: "We organize logs so teams can trace a failure across services and find the information needed for investigation." },
        { title: "Uptime and SLA targets", description: "We define measurable service objectives with your team and review any contractual service-level targets without promising universal uptime." },
        { title: "Incident response", description: "We document triage, escalation, recovery, and follow-up steps so incidents produce a clearer operating response." },
        { title: "Backup and disaster recovery", description: "We review backup coverage, restoration procedures, and recovery tests against your business requirements." },
      ] },
    ],
    process: { title: "Our DevOps and reliability process", introduction: "We start with the current delivery path, then improve the steps that create repeated work or operational risk.", steps: [
      { title: "Audit", visual: "Delivery and production", description: "We review deployments, environments, access, monitoring, and the incidents your team is trying to prevent." },
      { title: "Automate", visual: "Repeatable changes", description: "We introduce scoped delivery and infrastructure automation with checks, review points, and documented ownership." },
      { title: "Monitor", visual: "Useful service signals", description: "We connect agreed service health signals to dashboards, alerts, and response procedures." },
      { title: "Improve", visual: "Feedback from operations", description: "We use release and incident findings to prioritize the next improvement with your team." },
    ] },
    tools: ["GitHub Actions", "Jenkins", "Terraform", "Docker", "Kubernetes", "Prometheus", "Grafana", "CloudWatch"],
    results: { id: "devops-results", title: "Measure the operating changes that matter", introduction: "We agree on a starting point and review trends after changes. The measures help identify what to improve.", items: [
      { title: "Deployment frequency", description: "Track how often useful changes reach production and which checks or handoffs slow the process." },
      { title: "Downtime", description: "Review when users cannot use the service, what caused the interruption, and whether recurring failure paths are being addressed." },
      { title: "Recovery time", description: "Measure how long it takes to identify and restore a failed service, then improve the response and recovery steps." },
    ] },
    engagements: { id: "devops-engagements", title: "Start with the problem you need to solve", introduction: "We agree on the delivery scope and operating responsibilities before selecting a support arrangement.", items: [
      { title: "DevOps audit", description: "Review the current pipeline, environments, and production practices to identify a practical sequence of improvements." },
      { title: "Implementation", description: "Deliver the agreed pipeline, infrastructure, monitoring, or reliability changes with documentation and handoff." },
      { title: "Managed DevOps", description: "Discuss ongoing pipeline maintenance, monitoring, incident handling, and improvement work with explicit coverage and escalation rules." },
    ] },
    faqs: [
      { question: "What do DevOps consulting services include?", answer: "The scope typically includes delivery pipelines, environment setup, infrastructure definitions, monitoring, and operating procedures. We focus on the gaps in your current setup rather than introducing every tool at once. The engagement defines which changes and ongoing responsibilities are included." },
      { question: "How long does it take to set up a CI/CD pipeline?", answer: "Setup typically depends on your application structure, test coverage, environments, security requirements, and release approvals. An established application with useful automated tests needs different work from a system with manual deployment steps. We review the current path before proposing a schedule." },
      { question: "What is infrastructure as code and why does it matter?", answer: "Infrastructure as code describes infrastructure in files that can be versioned and reviewed. It helps teams reproduce environments and understand the changes made to them. It still needs access controls, change review, and a way to handle differences between the recorded configuration and the running environment." },
      { question: "What is site reliability engineering (SRE)?", answer: "Site reliability engineering applies engineering practices to operating dependable services. It commonly uses service objectives, monitoring, incident learning, and automation to balance reliability with the need to release changes. We adapt those practices to the size and operating needs of your team." },
      { question: "Do we need Kubernetes?", answer: "Not every application needs Kubernetes. It can be useful when orchestration requirements justify the additional operating work, but simpler hosting options may fit your team better. We compare the deployment needs and ownership effort before recommending it." },
      { question: "Can you provide ongoing monitoring and support?", answer: "We can discuss ongoing monitoring, maintenance, and incident support as a separate operating scope. Coverage hours, response expectations, escalation, and ownership need to be agreed for your environment. A managed engagement should make those responsibilities explicit." },
    ],
    related: { id: "devops-related", title: "Connect delivery with the rest of your cloud work", introduction: "Reliable releases depend on the environment they run in.", items: [
      { title: "Cloud Architecture & Migration", description: "Review the architecture and workload move that sit underneath your delivery process.", href: migrationPath, linkLabel: "Explore Cloud Architecture & Migration" },
      { title: "Cloud Cost Optimization", description: "Connect operational decisions with resource usage and cloud spend.", href: costPath, linkLabel: "Explore Cloud Cost Optimization" },
    ] },
    contact: { title: "Review the path from code to production", introduction: "Tell us how your team deploys changes and where releases or incidents cause repeated work. We can discuss an assessment and a focused improvement scope.", submitLabel: "Discuss your DevOps assessment" },
  },
  cost: {
    key: "cost", slug: "cloud-cost-optimization", name: "Cloud Cost Optimization", keyword: "cloud cost optimization services",
    seoTitle: "Cloud Cost Optimization Services | Vyntics", seoDescription: "Vyntics cloud cost optimization services help you review spend, rightsize resources, evaluate commitments, and build practical FinOps controls.",
    hero: { title: "Cloud cost optimization services", introduction: "Our cloud cost optimization services help you reduce cloud costs by connecting your bill to resource usage, ownership, and the performance your applications need.", outcome: "Pay only for the cloud you actually use", cta: "Get a free cloud cost audit", expectedImage: "/images/services/our-services-section/cloud-cost-optimization.png", imageAlt: "Laptop displaying a cloud cost dashboard with usage and spending charts" },
    signs: { id: "cost-signs", title: "Why cloud bills keep growing", introduction: "A rising bill can reflect real demand, avoidable waste, or a mix of both. We investigate the reasons before changing resources.", items: [
      { title: "Idle resources", description: "Unused development environments or resources with little activity continue to generate charges." },
      { title: "Oversized instances", description: "Capacity was chosen for a peak or an early estimate, but actual usage no longer supports that size." },
      { title: "No tagging or visibility", description: "Costs cannot be tied consistently to a team, workload, environment, or owner." },
      { title: "Unused storage", description: "Old snapshots, unattached volumes, or stored data remain without a reviewed retention or ownership decision." },
      { title: "Missed discounts", description: "Eligible, predictable usage is not reviewed against commitment options, or existing commitments no longer fit demand." },
    ] },
    offerings: [
      { id: "cost-services", title: "Our cost optimization services", introduction: "We review the cloud cost management decisions that drive your bill. We can also build AI tools that monitor your cloud spend and flag possible waste for human review.", items: [
        { title: "Cloud cost audit", description: "We connect billing data, resource inventory, usage, and ownership to identify the areas worth investigating." },
        { title: "Rightsizing", description: "We compare resource capacity with usage and performance requirements before proposing smaller or different configurations." },
        { title: "Reserved instances and savings plans", description: "We review eligible usage, commitment coverage, and expected demand before considering a purchasing commitment." },
        { title: "Auto-scaling", description: "We review scaling policies, thresholds, and minimum capacity so the environment responds to demand within agreed service limits." },
        { title: "Storage cleanup", description: "We review ownership, retention, access needs, and recovery requirements before removing or changing stored data." },
        { title: "Cost dashboards and alerts", description: "We make spend easier to review by workload and team, with alerts that prompt owners to investigate changes in usage." },
      ] },
      { id: "finops", title: "FinOps: keeping costs low long-term", introduction: "FinOps consulting connects financial decisions with engineering ownership. Our cloud cost optimisation review helps your team build a repeatable habit of checking usage, cost, and business need.", items: [
        { title: "Budgets", description: "We define useful spending thresholds and review points. Budget alerts notify owners; they do not automatically stop all cloud spending." },
        { title: "Tagging", description: "We agree on workload, environment, and ownership labels so cost reports can support decisions and follow-up." },
        { title: "Team-level cost reports", description: "We connect usage and spend with responsible teams, explain material changes, and record who will act on them." },
      ] },
    ],
    process: { title: "Our cloud cost optimization process", introduction: "We separate low-risk changes from decisions that need workload testing, financial review, or a longer operating view.", steps: [
      { title: "Audit", visual: "Spend and resource usage", description: "We review billing, resource inventory, usage patterns, ownership, and current commitments." },
      { title: "Quick wins", visual: "Reviewed low-risk changes", description: "We prioritize changes with clear ownership and limited operational risk, then validate their effect." },
      { title: "Long-term savings", visual: "Capacity and commitments", description: "We assess resource design, scaling, retention, and commitment options against expected demand." },
      { title: "Ongoing monitoring", visual: "Track changes in spend", description: "We establish reporting and review points so owners can investigate new cost changes." },
    ] },
    platforms: { title: "Cost tools across cloud platforms", introduction: "We use the billing and usage information available in your cloud environment to support an AWS cost optimization or Azure cost optimization review, or a Google Cloud cost review.", items: [
      { name: "AWS", role: "Billing and usage analysis", description: "AWS Cost Explorer and billing reports can help investigate spend and evaluate eligible commitments. We connect that information with workload usage and resource ownership before proposing changes." },
      { name: "Azure", role: "Cost Management", description: "Azure Cost Management supports cost analysis and budget alerts. We review costs alongside resource utilization, ownership, and the limits your applications need to operate within." },
      { name: "Google Cloud", role: "Cloud Billing", description: "Cloud Billing reports and budgets help teams review spend and investigate changes. We relate those views to projects, workload owners, and resource decisions; budget alerts alone do not cap usage." },
    ] },
    results: { id: "cost-results", title: "Understand what changed, not just what was suggested", introduction: "Savings depend on your environment, usage, existing commitments, and the changes your team can safely make. We compare actual costs and workload behavior without assuming a fixed savings percentage.", items: [
      { title: "Less avoidable waste", description: "Review unused resources, excess capacity, and retention choices against the needs of each workload." },
      { title: "Clearer ownership", description: "Give teams a useful view of the costs they influence and the recommendations they need to review." },
      { title: "Performance-aware decisions", description: "Check resource changes against service requirements so a lower bill is not the only acceptance measure." },
    ] },
    engagements: { id: "cost-engagements", title: "Choose a cost review that fits your needs", introduction: "We discuss access, scope, reporting needs, and approval responsibilities before starting work.", items: [
      { title: "One-time audit", description: "Review the bill and usage data, then receive a prioritized set of findings to discuss with your team." },
      { title: "Optimization project", description: "Work through agreed resource, configuration, reporting, or commitment changes with validation and ownership checks." },
      { title: "Monthly FinOps support", description: "Discuss a recurring cost review, reporting, and follow-up arrangement that fits your workload and team responsibilities." },
    ] },
    faqs: [
      { question: "How much can we save on our cloud bill?", answer: "Potential savings depend on current usage, resource sizing, retention, purchasing commitments, and your performance requirements. An environment with little avoidable waste has a different starting point from one with unused resources. We review the evidence before discussing opportunities and do not promise a savings percentage." },
      { question: "Will cost optimization affect performance?", answer: "A resource change can affect performance if it is made without understanding the workload. We review usage and service requirements, then plan validation and a recovery path for agreed changes. Cost reduction should be assessed alongside application behavior and reliability." },
      { question: "What is FinOps?", answer: "FinOps is a way for engineering, finance, and business teams to share responsibility for cloud spending. It combines cost visibility, ownership, planning, and regular review. The aim is to connect spending decisions with business needs rather than treat every cost as waste." },
      { question: "How long does a cloud cost audit take?", answer: "An audit typically depends on the number of accounts or subscriptions, billing access, tagging quality, and the range of services in use. Historical usage and workload context also affect the review. We agree on the audit scope before proposing a schedule." },
      { question: "What are reserved instances and savings plans?", answer: "These are cloud purchasing options that can reduce eligible usage charges in exchange for a commitment. On AWS, Reserved Instances apply to specified instance configurations, while Savings Plans use a spending commitment for eligible usage. The right choice depends on demand, eligibility, and how much flexibility you need." },
      { question: "How do you charge for cost optimization?", answer: "We discuss the fee and scope for an audit, implementation project, or ongoing support before work begins. The proposal depends on the environment, access, analysis, and delivery responsibilities involved. Your cloud provider charges and any purchasing commitments are separate from our consulting scope." },
    ],
    related: { id: "cost-related", title: "Connect cost decisions with architecture and operations", introduction: "Cloud spend is shaped by application design, delivery practices, and the information teams use to make decisions.", items: [
      { title: "Cloud Architecture & Migration", description: "Review the architecture and migration choices that affect your future operating costs.", href: migrationPath, linkLabel: "Explore Cloud Architecture & Migration" },
      { title: "DevOps & Reliability", description: "Build repeatable changes and useful operating signals for your cloud environment.", href: devopsPath, linkLabel: "Explore DevOps & Reliability" },
    ] },
    contact: { title: "Make your cloud spending easier to explain", introduction: "Tell us which cloud platforms you use and where the bill is becoming difficult to understand. We can discuss a cost audit and the information needed to scope a useful review.", submitLabel: "Discuss your cloud cost audit" },
  },
};
