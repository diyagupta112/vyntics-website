export const migrationArchitectureLegend = [
  { id: 1, title: "Secure connection", description: "An encrypted link between your data center and the cloud lets data and traffic move in stages while both environments keep running." },
  { id: 2, title: "Landing zone", description: "Accounts, identity, network layout and guardrails are set up first, so every workload lands in a consistent, governed environment." },
  { id: 3, title: "Network and edge", description: "DNS, firewall rules, content delivery and load balancing control how users reach the application and how traffic is spread." },
  { id: 4, title: "Application tier", description: "Application services run in more than one zone, designed so that the loss of a single zone does not take the application offline." },
  { id: 5, title: "Data and recovery", description: "Managed databases keep a standby copy in a second zone, object storage holds files, and backups are replicated to a second region for disaster recovery." },
  { id: 6, title: "Security and operations", description: "Encryption, key management, access control, logging and monitoring apply across every layer and are reviewed after cutover." },
] as const;

export type ArchitectureReference = typeof migrationArchitectureLegend[number]["id"];
export type ArchitectureLayout = "desktop" | "mobile";

// SVG badges and their HTML focus targets use the same coordinates.
export const architectureBadgePositions: Record<ArchitectureLayout, readonly { ref: ArchitectureReference; x: number; y: number }[]> = {
  desktop: [
    { ref: 1, x: 340, y: 60 }, { ref: 2, x: 1070, y: 38 }, { ref: 3, x: 1070, y: 78 },
    { ref: 4, x: 684, y: 196 }, { ref: 4, x: 1054, y: 196 },
    { ref: 5, x: 710, y: 322 }, { ref: 5, x: 1070, y: 322 }, { ref: 5, x: 1070, y: 460 },
    { ref: 6, x: 1070, y: 390 },
  ],
  mobile: [
    { ref: 1, x: 92, y: 395 }, { ref: 2, x: 375, y: 583 }, { ref: 3, x: 375, y: 618 },
    { ref: 4, x: 164, y: 742 }, { ref: 4, x: 340, y: 742 },
    { ref: 5, x: 170, y: 946 }, { ref: 5, x: 346, y: 946 }, { ref: 5, x: 375, y: 1156 },
    { ref: 6, x: 346, y: 1016 },
  ],
};

// One keyboard control per numbered point. Additional badges in the drawing stay
// visual so the tab order remains the meaningful 1–6 sequence.
export const architectureControlPositions: Record<ArchitectureLayout, readonly { ref: ArchitectureReference; x: number; y: number }[]> = {
  desktop: [
    { ref: 1, x: 340, y: 60 }, { ref: 2, x: 1070, y: 38 }, { ref: 3, x: 1070, y: 78 },
    { ref: 4, x: 684, y: 196 }, { ref: 5, x: 710, y: 322 }, { ref: 6, x: 1070, y: 390 },
  ],
  mobile: [
    { ref: 1, x: 92, y: 395 }, { ref: 2, x: 375, y: 583 }, { ref: 3, x: 375, y: 618 },
    { ref: 4, x: 164, y: 742 }, { ref: 5, x: 170, y: 946 }, { ref: 6, x: 346, y: 1016 },
  ],
};
