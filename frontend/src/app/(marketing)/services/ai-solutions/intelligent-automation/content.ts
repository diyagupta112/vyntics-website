import type { SubSection } from "@/content/cloud-sub-services/pages";
import type { MigrationEngagementStep } from "@/components/service-sub/migration-engagement-options.data";

export const intelligentAutomation = {
  key: "intelligent-automation",
  slug: "intelligent-automation",
  name: "Intelligent Automation",
  seoTitle: "Intelligent Automation Services | Vyntics",
  seoDescription: "Vyntics delivers intelligent automation services for document processing and AI workflow automation across invoices, forms, approvals, and connected systems.",
  hero: {
    title: "Intelligent automation services for repetitive work",
    introduction: "Use AI-powered document processing and workflow automation to reduce manual administration across invoices, forms, approvals, and other repeatable processes.",
    outcome: "Connect document understanding with workflows your team can review and operate.",
    cta: "Discuss intelligent automation",
    expectedImage: "/images/services/our-services-section/ai-service-automation.jpg",
    imageAlt: "Person reviewing a printed document while working at a laptop",
  },
} as const;

export const intelligentAutomationSections: {
  signs: SubSection;
  documentProcessing: SubSection;
  workflowAutomation: SubSection;
  useCases: SubSection;
  results: SubSection;
  related: SubSection;
} = {
  signs: {
    id: "intelligent-automation-signs",
    title: "Signs you need intelligent automation",
    introduction: "Paperwork and repetitive steps can slow down work when information must be copied, checked, and routed by hand.",
    items: [
      { title: "Staff keep typing details from incoming PDFs and emails by hand", description: "Documents arrive as unstructured PDFs and emails, and no document processing tool reads and routes them automatically." },
      { title: "Requests sit waiting for someone to review and approve them", description: "Approvals depend on email, reminders and manual handoffs, with no workflow automation to route requests." },
      { title: "Small mistakes keep slipping into records and need correcting later", description: "Information is retyped or copied between systems, which makes small inconsistencies likely and hard to spot." },
      { title: "Staff spend too much of their time on repetitive paperwork", description: "Routine steps are still handled by people because the process has not been automated end to end." },
    ],
  },
  documentProcessing: {
    id: "intelligent-document-processing",
    title: "Intelligent document processing",
    introduction: "AI can identify and extract relevant information from invoices, contracts, forms, IDs, and receipts, turning document content into structured data for downstream workflows.",
    items: [
      { title: "Identify relevant information", description: "Apply document recognition to locate fields and content needed by a specific process." },
      { title: "Extract structured data", description: "Organize extracted values so they can be checked and passed to connected business systems." },
      { title: "Reduce manual data entry", description: "Limit repeated transcription while keeping validation in the process." },
      { title: "Route exceptions for review", description: "Send uncertain or incomplete cases to a person when the workflow requires human judgment." },
    ],
  },
  workflowAutomation: {
    id: "ai-workflow-automation",
    title: "AI workflow automation",
    introduction: "AI process automation adds AI-assisted steps to existing workflows to coordinate approvals, notifications, data entry, and handoffs across the tools your business already uses.",
    items: [
      { title: "Approvals", description: "Route requests and extracted information to the appropriate reviewer using agreed rules." },
      { title: "Notifications", description: "Notify owners when a request needs attention or a workflow step is ready." },
      { title: "Data entry", description: "Pass validated information into connected tools rather than re-entering it manually." },
      { title: "Handoffs across tools", description: "Coordinate process steps across systems while keeping ownership and exceptions visible." },
    ],
  },
  useCases: {
    id: "intelligent-automation-use-cases",
    title: "Use cases",
    introduction: "Apply document and workflow automation to specific, reviewable business processes.",
    items: [
      { title: "Invoice processing", description: "Extract invoice details for validation and routing through an accounts payable workflow." },
      { title: "Contract review", description: "Identify selected contract information for review by the people responsible for the agreement." },
      { title: "Customer onboarding / KYC", description: "Collect and organize customer-submitted information and documents for required review steps." },
      { title: "Claims processing", description: "Capture claim details from submitted documents and route cases through assessment steps." },
      { title: "HR paperwork", description: "Organize information from employee forms and route it to the appropriate HR process." },
    ],
  },
  results: {
    id: "intelligent-automation-results",
    title: "What intelligent automation can improve",
    introduction: "We review the outcomes that matter to each workflow and measure them against your own baseline, without assuming a fixed result.",
    items: [
      { title: "Hours saved", description: "Review how much staff time routine document handling and repeated process steps require." },
      { title: "Processing time", description: "Track how quickly documents move from receipt through validation and the next workflow step." },
      { title: "Error reduction", description: "Monitor correction and exception patterns to understand where automation or process rules need adjustment." },
    ],
  },
  related: {
    id: "intelligent-automation-related-services",
    title: "Connect automation with AI knowledge and action",
    introduction: "Intelligent automation can work alongside AI systems that retrieve company knowledge or complete controlled multi-step tasks.",
    items: [
      { title: "AI Agents", description: "Build controlled agents that use approved tools to carry out defined workflow steps.", href: "/services/ai-solutions/ai-agents", linkLabel: "Explore AI Agents" },
      { title: "RAG & Knowledge Assistants", description: "Help people find answers grounded in approved company documents and knowledge.", href: "/services/ai-solutions/rag-knowledge-assistants", linkLabel: "Explore RAG & Knowledge Assistants" },
    ],
  },
};

export const automationUseCasesFlow = [
  "Document in",
  "AI extracts data",
  "Validation",
  "System update",
  "Human review for exceptions",
] as const;

export const intelligentAutomationProcess = [
  { title: "Map the workflow", visual: "Inputs, rules, and exceptions", description: "Understand the existing process, inputs, approvals, systems, exceptions, and business rules." },
  { title: "Pilot", visual: "A focused workflow", description: "Select a focused workflow and prove the automation approach with representative cases." },
  { title: "Automate", visual: "Connected process steps", description: "Build the document processing, workflow logic, integrations, and required controls." },
  { title: "Test", visual: "Normal and edge cases", description: "Test normal cases, edge cases, validation, exceptions, and human-review paths." },
  { title: "Monitor", visual: "Processing and exceptions", description: "Track processing, errors, exceptions, performance, and opportunities for improvement." },
] as const;

export const intelligentAutomationTools = [
  "n8n",
  "Make",
  "Zapier",
  "Amazon Textract",
  "Google Document AI",
  "Azure Document Intelligence",
  "Power Automate",
] as const;

export const automationEngagements: readonly MigrationEngagementStep[] = [
  {
    id: "automation-audit", number: "01", icon: "assess", title: "Automation audit",
    problem: "We need to understand which workflow is suitable to automate.",
    description: "Review the process, documents, systems, rules, and exceptions to identify a practical pilot scope.",
    bullets: ["Current workflow and handoffs", "Document, system, and rule review", "Prioritized automation opportunity"],
  },
  {
    id: "automation-pilot", number: "02", icon: "migrate", title: "Pilot",
    problem: "We want to test the approach on a focused workflow.",
    description: "Build and review a bounded automation pilot using representative cases and the required human checks.",
    bullets: ["Focused workflow scope", "Validation and exception paths", "Pilot review with your team"],
  },
  {
    id: "automation-rollout", number: "03", icon: "manage", title: "Full rollout",
    problem: "The pilot is understood and we are ready to expand delivery.",
    description: "Plan a broader rollout with integrations, controls, monitoring, and ownership agreed for operation.",
    bullets: ["Agreed workflow rollout plan", "System integration and controls", "Monitoring and operating ownership"],
  },
];

export const intelligentAutomationFaqs = [
  { question: "What is intelligent automation?", answer: "Intelligent automation combines workflow automation with AI capabilities such as document recognition or information extraction. It can move structured information through business processes, while validation and human review remain part of the design where needed." },
  { question: "How is intelligent automation different from RPA?", answer: "Traditional RPA generally follows defined rules to interact with systems and repeat predictable steps. Intelligent automation can add AI to interpret documents or less structured information before applying workflow rules. RPA with AI can combine both approaches, with clear controls and exception handling." },
  { question: "Which documents can AI read accurately?", answer: "Document results depend on the document type, layout, scan quality, language, and the fields being extracted. Invoices, contracts, forms, IDs, and receipts are possible use cases, but each workflow needs evaluation and validation against representative documents." },
  { question: "What happens when the AI is unsure about a document?", answer: "The workflow can include validation checks and route uncertain, incomplete, or mismatched cases to a person for review where the selected tools and process support it. The system should make exceptions visible rather than treating every extraction as correct." },
  { question: "Can it connect to our ERP or accounting software?", answer: "Integration depends on the software, available APIs or connectors, access controls, data requirements, and the workflow. We review the systems involved and confirm a practical integration approach before implementation." },
  { question: "How much does intelligent automation cost?", answer: "Cost depends on workflow complexity, document types and variation, systems to connect, validation needs, exception paths, and rollout scope. We clarify these requirements before proposing a scoped engagement; there is no fixed price for every process." },
] as const;

export const automationUseCaseDetails = [
  { name: "Invoice processing", description: "Extract invoice details for validation and routing through an accounts payable workflow.", focus: [
    { title: "Detail extraction", description: "Read invoices as they arrive and capture the fields the process needs." },
    { title: "Validation checks", description: "Check captured details against your rules and existing records." },
    { title: "Routing", description: "Send validated invoices to the next step in the accounts payable workflow." },
  ], control: "Invoices that fail a check are held for a person to review before they move on.", cta: "Want invoices to reach approval with less manual entry?" },
  { name: "Contract review", description: "Identify selected contract information for review by the people responsible for the agreement.", focus: [
    { title: "Key information capture", description: "Identify selected terms and details in a contract for review." },
    { title: "Review preparation", description: "Organize extracted information so the reviewer can see it alongside the source document." },
    { title: "Routing to owners", description: "Send each contract to the people responsible for the agreement." },
  ], control: "The people responsible for the agreement review and decide; automation prepares the information.", cta: "Want contract details organized before review begins?" },
  { name: "Customer onboarding / KYC", description: "Collect and organize customer-submitted information and documents for required review steps.", focus: [
    { title: "Document collection", description: "Gather customer-submitted information and documents in one place." },
    { title: "Information organization", description: "Organize details around the checks and steps the process requires." },
    { title: "Review steps", description: "Pass each case through every required review step." },
  ], control: "Required checks and decisions stay with the people who own the review.", cta: "Want onboarding that keeps required reviews on track?" },
  { name: "Claims processing", description: "Capture claim details from submitted documents and route cases through assessment steps.", focus: [
    { title: "Detail capture", description: "Capture claim details from the documents a customer submits." },
    { title: "Case routing", description: "Route each case to the right assessment step." },
    { title: "Missing information", description: "Flag cases where required information is incomplete." },
  ], control: "Assessment decisions are made by the people responsible for the claim.", cta: "Want claims to reach assessment with the right details?" },
  { name: "HR paperwork", description: "Organize information from employee forms and route it to the appropriate HR process.", focus: [
    { title: "Form intake", description: "Read employee forms as they are submitted." },
    { title: "Information organization", description: "Arrange the details in the format the HR process needs." },
    { title: "Routing", description: "Send each item to the appropriate HR process." },
  ], control: "People data stays within the access rules you set, and HR reviews anything that needs a decision.", cta: "Want HR paperwork routed without manual re-entry?" },
] as const;
