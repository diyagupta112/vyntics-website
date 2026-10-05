export type CloudServiceSlug = "architecture" | "migration" | "cost-optimization" | "devops-infrastructure" | "reliability-monitoring";

export type CloudService = {
  slug: CloudServiceSlug;
  number: string;
  title: string;
  metaDescription: string;
  headline: string;
  summary: string;
  meaning: string;
  problems: readonly string[];
  help: readonly string[];
  workAreas: ReadonlyArray<{ title: string; text: string }>;
  approach: ReadonlyArray<{ title: string; text: string }>;
  technologies: readonly string[];
  nextSlug: CloudServiceSlug;
};

export const cloudServices: Record<CloudService["slug"], CloudService> = {
  architecture: {
    slug: "architecture",
    number: "01",
    title: "Cloud Architecture",
    metaDescription: "Cloud architecture planning and design shaped around workloads, reliability, scalability, maintainability, and operational ownership.",
    headline: "Design the cloud foundation before complexity designs it for you.",
    summary: "Cloud Architecture focuses on the underlying structure of an environment: how workloads fit together, where responsibilities sit, and how the system can evolve without becoming harder to operate.",
    meaning: "Vyntics approaches architecture as a set of explicit technical and operational decisions. The goal is to create an environment that reflects real workloads, supports expected change, and can be understood by the people responsible for it.",
    problems: [
      "Environments have grown without a clear structure or documented decisions.",
      "New workloads need a more deliberate path for scale, resilience, and change.",
      "Teams lack a shared view of infrastructure boundaries and ownership.",
    ],
    help: [
      "Assess workloads, dependencies, operating requirements, and future change.",
      "Define environment boundaries, core infrastructure, and service responsibilities.",
      "Document architecture decisions, tradeoffs, and the ownership needed to operate them.",
    ],
    workAreas: [
      { title: "Workload and dependency mapping", text: "Understand what the environment must run, how systems connect, and which constraints shape the architecture." },
      { title: "Environment structure", text: "Define practical boundaries between workloads, stages, teams, and shared infrastructure." },
      { title: "Scale and reliability decisions", text: "Make resilience, capacity, and change considerations visible before they become production issues." },
      { title: "Architecture documentation", text: "Record the important choices, their tradeoffs, and the responsibilities required to operate the result." },
    ],
    approach: [
      { title: "Assess", text: "Review the workloads, dependencies, constraints, and current operating model." },
      { title: "Shape options", text: "Compare architecture directions and make the tradeoffs explicit." },
      { title: "Define the foundation", text: "Detail the environment structure and responsibilities needed for delivery." },
      { title: "Review and transfer", text: "Validate the design with stakeholders and leave the decisions documented." },
    ],
    technologies: ["AWS", "Microsoft Azure", "Google Cloud", "Terraform", "Kubernetes"],
    nextSlug: "migration",
  },
  migration: {
    slug: "migration",
    number: "02",
    title: "Cloud Migration",
    metaDescription: "Cloud migration assessment, planning, implementation, validation, and transition for applications, data, and infrastructure.",
    headline: "Move workloads with a plan for what happens before, during, and after the transition.",
    summary: "Cloud Migration covers the controlled movement of applications, data, and infrastructure toward a cloud environment while keeping dependencies, validation, and operational ownership visible.",
    meaning: "A migration is more than a transfer of hosting. It changes how systems are deployed, connected, observed, and supported. Vyntics helps turn that change into a sequence of assessable decisions and manageable delivery stages.",
    problems: [
      "A move to the cloud is blocked by unclear dependencies or an uncertain starting point.",
      "Migration activity needs to happen without losing sight of continuity and validation.",
      "The destination is known, but the sequencing and transition responsibilities are not.",
    ],
    help: [
      "Inventory the current environment and identify workload dependencies.",
      "Shape migration waves, transition criteria, and a practical implementation plan.",
      "Validate integrations and behavior before completing the operational handover.",
    ],
    workAreas: [
      { title: "Current-state assessment", text: "Create a usable view of applications, data, infrastructure, dependencies, and operating constraints." },
      { title: "Migration strategy", text: "Group workloads into sensible stages and define the criteria for moving each one." },
      { title: "Implementation readiness", text: "Prepare the destination environment, deployment path, access, and operational prerequisites." },
      { title: "Validation and transition", text: "Check behavior and integrations, document the result, and support the handover into normal operation." },
    ],
    approach: [
      { title: "Assess", text: "Understand the current estate, dependencies, and reasons for moving." },
      { title: "Plan", text: "Define migration stages, readiness criteria, and transition responsibilities." },
      { title: "Implement", text: "Move workloads in controlled increments with validation at each stage." },
      { title: "Transition", text: "Confirm operation, document the environment, and complete the handover." },
    ],
    technologies: ["AWS", "Microsoft Azure", "Google Cloud", "Docker"],
    nextSlug: "cost-optimization",
  },
  "cost-optimization": {
    slug: "cost-optimization",
    number: "03",
    title: "Cost Optimization",
    metaDescription: "Cloud cost optimization focused on usage visibility, resource efficiency, allocation, and the balance between cost and performance.",
    headline: "Understand what cloud spend supports before deciding what should change.",
    summary: "Cloud Cost Optimization connects usage and ownership to infrastructure spend, then identifies practical ways to improve allocation without losing sight of performance and resilience.",
    meaning: "Reducing a bill without understanding the system can move cost into performance problems or operational risk. Vyntics starts by making usage and cost drivers clearer, then evaluates changes in the context of how the workload needs to behave.",
    problems: [
      "Spend is rising, but teams cannot connect it clearly to workloads or environments.",
      "Resources, storage, or capacity no longer reflect how systems are actually used.",
      "Cost decisions happen without a consistent view of their performance tradeoffs.",
    ],
    help: [
      "Create clearer visibility across usage, ownership, and recurring cost drivers.",
      "Identify idle, oversized, duplicated, or poorly scheduled resources.",
      "Recommend practical allocation and operating changes with performance in view.",
    ],
    workAreas: [
      { title: "Usage and cost visibility", text: "Organize spend around environments, workloads, and the teams responsible for them." },
      { title: "Resource efficiency", text: "Review capacity, scheduling, storage, and recurring usage patterns for avoidable waste." },
      { title: "Allocation and ownership", text: "Make it easier to understand who uses resources and where decisions need to be made." },
      { title: "Cost and performance balance", text: "Evaluate proposed changes alongside the workload behavior and reliability they must preserve." },
    ],
    approach: [
      { title: "Establish visibility", text: "Connect usage and spend to the environments and workloads creating them." },
      { title: "Investigate", text: "Find inefficient patterns and understand why the resources exist." },
      { title: "Prioritize", text: "Rank practical changes by effort, operational impact, and expected usefulness." },
      { title: "Improve the operating view", text: "Leave teams with clearer information for ongoing cost decisions." },
    ],
    technologies: ["AWS", "Microsoft Azure", "Google Cloud"],
    nextSlug: "devops-infrastructure",
  },
  "devops-infrastructure": {
    slug: "devops-infrastructure",
    number: "04",
    title: "DevOps & Infrastructure",
    metaDescription: "Infrastructure automation, deployment workflows, environment consistency, CI/CD, and maintainable cloud operations.",
    headline: "Make infrastructure and delivery workflows repeatable enough to trust.",
    summary: "DevOps & Infrastructure work focuses on how environments are defined, changed, and released so that delivery does not depend on repeated manual effort or undocumented individual knowledge.",
    meaning: "Consistency comes from making infrastructure and release decisions visible, reviewable, and reproducible. Vyntics helps connect infrastructure management with the workflows teams use to build, validate, deploy, and recover software.",
    problems: [
      "Deployments depend on manual steps, individual knowledge, or inconsistent environments.",
      "Infrastructure changes are difficult to review, reproduce, or recover from.",
      "Teams spend time reconciling configuration differences instead of improving the system.",
    ],
    help: [
      "Define infrastructure through reviewable, repeatable automation.",
      "Improve build, deployment, validation, and rollback workflows.",
      "Clarify configuration, environment responsibilities, and operating documentation.",
    ],
    workAreas: [
      { title: "Infrastructure automation", text: "Represent infrastructure changes in a form that can be reviewed, repeated, and maintained." },
      { title: "Deployment workflows", text: "Create clearer paths for building, validating, releasing, and rolling back changes." },
      { title: "Environment consistency", text: "Reduce avoidable differences between development, testing, and production environments." },
      { title: "Operational ownership", text: "Document configuration, responsibilities, and the workflows teams need after delivery." },
    ],
    approach: [
      { title: "Map the workflow", text: "Understand how infrastructure and application changes currently move toward production." },
      { title: "Remove fragile steps", text: "Identify manual handoffs, configuration drift, and unclear validation points." },
      { title: "Automate deliberately", text: "Implement repeatable infrastructure and delivery workflows around the real release process." },
      { title: "Document operation", text: "Make the resulting process understandable to the teams who will use and maintain it." },
    ],
    technologies: ["Terraform", "Kubernetes", "Docker", "AWS", "Microsoft Azure", "Google Cloud"],
    nextSlug: "reliability-monitoring",
  },
  "reliability-monitoring": {
    slug: "reliability-monitoring",
    number: "05",
    title: "Reliability Monitoring",
    metaDescription: "Cloud monitoring and observability for system health, performance visibility, incident awareness, and reliability improvement.",
    headline: "See how systems behave before an incident becomes the first useful signal.",
    summary: "Reliability Monitoring gives teams a coherent view of infrastructure and application health so they can recognize meaningful changes, investigate incidents, and improve recurring weak points.",
    meaning: "Monitoring is useful when it explains the state of a service and helps people decide what to do next. Vyntics helps organize metrics, logs, dashboards, and alerts around the behavior teams actually need to understand.",
    problems: [
      "Teams learn about failures from users before they see them in monitoring.",
      "Alerts are noisy while the signals that explain performance remain fragmented.",
      "Recurring incidents do not feed back into a clear reliability improvement plan.",
    ],
    help: [
      "Define useful health indicators across infrastructure and application behavior.",
      "Bring metrics, logs, dashboards, and alerting into a coherent operating view.",
      "Create clearer incident context and feed recurring findings back into improvements.",
    ],
    workAreas: [
      { title: "System health", text: "Define the indicators that show whether infrastructure and applications are behaving as expected." },
      { title: "Observability", text: "Bring useful metrics, logs, and operational context into a connected view." },
      { title: "Alert and incident awareness", text: "Reduce noise and shape alerts around conditions that require meaningful action." },
      { title: "Reliability improvement", text: "Use recurring findings to identify where architecture, capacity, or operating practices should change." },
    ],
    approach: [
      { title: "Define what matters", text: "Identify the services, behavior, and user-facing conditions that need visibility." },
      { title: "Connect the signals", text: "Organize metrics, logs, dashboards, and alerts around those conditions." },
      { title: "Make response clearer", text: "Add context and documentation that help teams investigate and act." },
      { title: "Feed learning back", text: "Turn recurring operational findings into prioritized reliability improvements." },
    ],
    technologies: ["Grafana", "Kubernetes", "AWS", "Microsoft Azure", "Google Cloud"],
    nextSlug: "architecture",
  },
};

export const cloudServiceList = Object.values(cloudServices);
