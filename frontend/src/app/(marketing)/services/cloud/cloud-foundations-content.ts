export const cloudProblems = ["Ageing Servers", "Scaling Limits", "High Maintenance Cost", "Security Gaps"] as const;
export const cloudSteps = [
  { title: "Assess", description: "Understand your infrastructure, workloads, risks, requirements, and business goals." },
  { title: "Plan", description: "Define the target architecture, migration approach, security requirements, and delivery priorities." },
  { title: "Build", description: "Implement the cloud architecture, infrastructure, and required integrations in controlled stages." },
  { title: "Optimise", description: "Improve reliability, performance, security, and cloud resource usage." },
  { title: "Support", description: "Monitor, maintain, and improve the environment, with documentation and clear operational ownership." },
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

export const cloudServiceIntroductions = [
  {
    summary: "Design a well-architected cloud environment and move your workloads with a practical migration plan. We establish landing zones, secure networks, high availability, and disaster recovery, then rehost, replatform, or refactor applications and databases as needed.",
    includes: ["Architecture, landing zones, and security", "High availability and disaster recovery", "Application and database migration"],
  },
  {
    summary: "Make releases repeatable and operations easier to manage. We build CI/CD pipelines and infrastructure as code with Terraform, support containers and Kubernetes where appropriate, and connect DevSecOps practices with monitoring, logging, and incident response.",
    includes: ["CI/CD and infrastructure as code", "Containers, Kubernetes, and DevSecOps", "Monitoring, uptime targets, and backup recovery"],
  },
  {
    summary: "Understand what drives your cloud bill and address unnecessary spend without losing sight of performance. We audit usage, rightsize resources, review reserved instances and savings plans, and introduce FinOps practices for ongoing cost control.",
    includes: ["Cost audits, rightsizing, and savings plans", "Auto-scaling and storage cleanup", "Cost dashboards, budgets, and alerts"],
  },
] as const;

export const cloudFaqAnswers = [
  "Cloud consulting services help you assess, design, migrate, and improve your cloud environment. Vyntics works across architecture, infrastructure delivery, reliability, security, and cost optimization, with ongoing support where needed.",
  "The right platform depends on your workloads, existing systems, team skills, security requirements, and budget. We assess AWS, Azure, and Google Cloud against those needs and explain the tradeoffs before recommending an architecture.",
  "Migration timing depends on the number and complexity of workloads, dependencies, data volumes, and acceptable downtime. We assess those factors first, then plan staged migration and validation around your business requirements.",
  "Cost depends on the scope: an assessment, architecture design, migration, DevOps implementation, or ongoing support. After reviewing your environment and priorities, we define the work and commercial approach so you can make an informed decision.",
  "Yes. Managed cloud services can include monitoring, maintenance, incident response, backup checks, and continued optimization. We agree responsibilities and support requirements with your team before the engagement starts.",
  "We design access controls, network boundaries, monitoring, and recovery practices around your workloads and requirements. We also review the compliance obligations you identify and document the controls and responsibilities needed to support them; compliance depends on the wider business processes as well as infrastructure.",
] as const;
