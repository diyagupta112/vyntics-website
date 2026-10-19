export type MigrationEngagementIcon = "assess" | "migrate" | "manage";

export type MigrationEngagementStep = {
  id: string;
  number: string;
  icon: MigrationEngagementIcon;
  title: string;
  problem: string;
  description: string;
  bullets: readonly [string, string, string];
};

export const migrationEngagementSteps: readonly MigrationEngagementStep[] = [
  {
    id: "assess",
    number: "01",
    icon: "assess",
    title: "Migration assessment",
    problem: "We're not sure what to move, or in what order.",
    description: "We review your systems, dependencies and risks, then give you a clear migration plan you can act on.",
    bullets: [
      "Inventory of applications, servers and databases",
      "Dependency and risk review",
      "Target architecture and phased plan",
    ],
  },
  {
    id: "migrate",
    number: "02",
    icon: "migrate",
    title: "Full migration",
    problem: "We have a plan and want it done.",
    description: "We design the target environment, move your workloads in controlled stages, then validate and hand over.",
    bullets: [
      "Landing zone and target environment design",
      "Staged migration of applications and databases",
      "Validation and handover",
    ],
  },
  {
    id: "manage",
    number: "03",
    icon: "manage",
    title: "Ongoing management",
    problem: "We're in the cloud and want it looked after.",
    description: "We keep your environment monitored, supported and reviewed, so it stays secure, reliable and cost-aware as your business changes.",
    bullets: [
      "Monitoring and support",
      "Regular cost, security and performance reviews",
      "Continuous improvements",
    ],
  },
] as const;

export type DevopsEngagementDetails = Omit<MigrationEngagementStep, "title" | "description">;

export const devopsEngagementDetails: readonly DevopsEngagementDetails[] = [
  {
    id: "audit",
    number: "01",
    icon: "assess",
    problem: "We need a clearer view of where releases and incidents break down.",
    bullets: [
      "CI/CD and deployment steps reviewed",
      "Environments and infrastructure changes reviewed",
      "Monitoring and incident response gaps identified",
    ],
  },
  {
    id: "implementation",
    number: "02",
    icon: "migrate",
    problem: "We know what needs to change and want it delivered.",
    bullets: [
      "CI/CD pipeline and release workflow changes",
      "Infrastructure as code and environment updates",
      "Monitoring and reliability improvements",
    ],
  },
  {
    id: "managed",
    number: "03",
    icon: "manage",
    problem: "We need ongoing help keeping releases and services reliable.",
    bullets: [
      "Pipeline and infrastructure maintenance",
      "Monitoring and incident support",
      "Agreed coverage and escalation responsibilities",
    ],
  },
] as const;

export const costEngagementDetails: readonly DevopsEngagementDetails[] = [
  {
    id: "cost-audit",
    number: "01",
    icon: "assess",
    problem: "We need to understand what is driving our cloud bill.",
    bullets: [
      "Billing and resource usage reviewed",
      "Ownership and visibility gaps identified",
      "Prioritized findings for your team",
    ],
  },
  {
    id: "cost-optimization",
    number: "02",
    icon: "migrate",
    problem: "We know the opportunities and want to make changes safely.",
    bullets: [
      "Agreed rightsizing and configuration changes",
      "Performance and service limits considered",
      "Changes validated with your team",
    ],
  },
  {
    id: "finops-support",
    number: "03",
    icon: "manage",
    problem: "We want a regular way to keep cost decisions visible.",
    bullets: [
      "Recurring cost and usage reviews",
      "Team-level reports and budget signals",
      "Follow-up on agreed cost actions",
    ],
  },
] as const;
