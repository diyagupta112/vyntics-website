export const cloudProblems = ["ageing servers", "scaling limits", "high maintenance cost", "security gaps"] as const;
export const cloudSteps = [
  { title: "Assess", description: "Workloads, dependencies, constraints, and ownership." },
  { title: "Plan", description: "Architecture decisions, priorities, and delivery planning." },
  { title: "Build", description: "Implementation and validation in controlled stages." },
  { title: "Optimise", description: "Cost, performance, and reliability." },
  { title: "Support", description: "Documentation and operational ownership." },
] as const;
export const cloudQuestions = [
  "What are cloud consulting services?",
  "Which cloud platform is right for my business: AWS, Azure or Google Cloud?",
  "How long does a cloud migration take?",
  "How much do cloud consulting services cost?",
  "Can you manage our cloud after setup?",
  "How do you keep our cloud secure and compliant?",
] as const;

// Match authored metadata; hosting an unrelated AI project on AWS alone does not make it a cloud case study.
export function isCloudContent(fields: readonly string[]) {
  return fields.some(field => /\b(cloud|aws|azure|gcp|devops|infrastructure|kubernetes|terraform|finops)\b/i.test(field));
}
