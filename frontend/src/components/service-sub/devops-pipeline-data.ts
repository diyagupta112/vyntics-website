export type PipelineReference = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type PipelineIcon = "commit" | "build" | "test" | "shield" | "deploy" | "monitor";

export const devopsPipelineLegend: readonly {
  id: PipelineReference; title: string; description: string; items: readonly string[];
}[] = [
  { id: 1, title: "Commit and review", items: ["Pull request", "Code review", "Branch protection"], description: "Every change starts as a commit on a protected branch. Pull requests and code review keep changes small, visible and reviewed before they move on." },
  { id: 2, title: "Build", items: ["Compile and package", "Container image", "Versioned artifact"], description: "The pipeline compiles and packages the change into a versioned artifact, such as a container image, so the same build can be promoted through every environment." },
  { id: 3, title: "Automated tests", items: ["Unit tests", "Integration tests", "Quality gate"], description: "Unit and integration tests run automatically on every change, and a quality gate stops a failing build before it reaches users." },
  { id: 4, title: "Security scanning", items: ["Dependency check", "Secret detection", "Image scan"], description: "Dependency checks, secret detection and image scanning run inside the pipeline, so security issues are caught early, not after release." },
  { id: 5, title: "Deploy", items: ["Staging", "Approval gate", "Production"], description: "Changes deploy to staging first. After an approval gate, they roll out to production in a controlled way, designed with a quick path back if something goes wrong." },
  { id: 6, title: "Monitor and feedback", items: ["Metrics and logs", "Alerts", "Incident response"], description: "Metrics, logs and alerts show how each release behaves in production. What the team learns flows back into the next commit." },
  { id: 7, title: "Shared foundations", items: ["Artifact registry", "Access and secrets", "Infrastructure as code"], description: "Environments are defined as version-controlled code, artifacts live in a registry, and access and secrets are managed centrally, so every environment is repeatable and auditable." },
];

export const pipelineStages: readonly { title: string; icon: PipelineIcon }[] = [
  { title: "Commit", icon: "commit" }, { title: "Build", icon: "build" }, { title: "Test", icon: "test" },
  { title: "Security scan", icon: "shield" }, { title: "Deploy", icon: "deploy" }, { title: "Monitor", icon: "monitor" },
];

// Layout constants. Every connector, badge and label in the diagram is derived from these.
export const PIPE = {
  width: 1100, cardW: 156, cardH: 200, gap: 22, cardTop: 100, loopRise: 36,
  frameGap: 44, frameH: 124, boxH: 52, boxOffset: 60, bottomPad: 24, badgeR: 13,
} as const;
const columns = pipelineStages.length;
export const PIPE_LEFT = (PIPE.width - (columns * PIPE.cardW + (columns - 1) * PIPE.gap)) / 2;
export const PIPE_SPAN = columns * PIPE.cardW + (columns - 1) * PIPE.gap;
export const pipeCardX = (index: number) => PIPE_LEFT + index * (PIPE.cardW + PIPE.gap);
export const pipeCardCenter = (index: number) => pipeCardX(index) + PIPE.cardW / 2;
export const PIPE_CARD_BOTTOM = PIPE.cardTop + PIPE.cardH;
export const PIPE_LOOP_Y = PIPE.cardTop - PIPE.loopRise;
export const PIPE_FRAME_Y = PIPE_CARD_BOTTOM + PIPE.frameGap;
export const PIPE_BOX_Y = PIPE_FRAME_Y + PIPE.boxOffset;
export const PIPE_HEIGHT = PIPE_FRAME_Y + PIPE.frameH + PIPE.bottomPad;
/** Shared foundations boxes: the card column each one sits under. */
export const pipeFoundations: readonly { label: string; column: number }[] = [
  { label: "Artifact registry", column: 1 }, { label: "Access and secrets", column: 3 }, { label: "Infrastructure as code", column: 4 },
];

/** Badge centers (top-left corner of each card, and of the foundations frame). */
export const pipeBadges: readonly { ref: PipelineReference; x: number; y: number }[] = [
  ...pipelineStages.map((_, index) => ({ ref: (index + 1) as PipelineReference, x: pipeCardX(index), y: PIPE.cardTop })),
  { ref: 7, x: PIPE_LEFT, y: PIPE_FRAME_Y },
];
