# Cloud Foundations sub-service implementation

Three new pages use authored, data-driven copy and minimal draft section layouts. The existing pillar layouts, shared components, shared styles, header, footer, contact form and API contracts are unchanged. Only their route/link registrations were updated.

## Existing site inspected before implementation

Cloud Foundations and Analytics & BI were opened in the browser and their source components inspected.

| Section | Existing component | Data and location |
| --- | --- | --- |
| Hero | `ServicesHero` | Inline Cloud props and `canonical-cloud-services.ts`; Analytics `analytics-bi-content.ts`. Shared hero visuals come from `src/content/services-hero-visuals.ts`. |
| Problems | `CloudProblems` / `AnalyticsProblems` | Their page-local component files and Cloud/Analytics content files. |
| Sub-services | `DataEngineeringServicesShowcase` | Cloud canonical services and `cloud-foundations-content.ts`; Analytics content services array. |
| Why Vyntics | `CloudWhy` / `AnalyticsWhy` | Page-local Why components/content and image paths. |
| Platforms | `ServicePillarPlatforms` | Cloud inline platform data; Analytics content platforms array. |
| Process | `ServicePillarApproach` | Cloud `cloudSteps`; Analytics content process data. |
| Case studies | `ServiceCaseStudyGallery` | Existing `getCaseStudies(related_service)` feed. |
| What comes next | `NextServiceBanner` | Shared next-service/navigation configuration, selected by current service. |
| Insights | `RelatedBlogCard` | Existing `getBlogs(related_service)` feed, first three on each pillar. |
| FAQ | `CloudFaq` / `AnalyticsFaq`, using `FaqContent` | Page-local FAQ arrays; shared accessible details/summary behavior. |
| Contact | `ContactCta` | Existing component's form, validation and submission; page-provided heading/intro/button labels. |

Existing generic Cloud sub-service routes and sitemap entries already established the three canonical paths. Static pages now supply their dedicated content. The US cost path is canonical; both old UK-spelled Cloud paths permanently redirect to it. Pillar hero/service links and navigation-generated footer/menu links use the canonical routes. The existing sitemap already registered all three, so its config required no edit.

## Section tables
### Cloud Architecture & Migration

Route: `/services/cloud-foundations/cloud-architecture-migration`

| Section, in display order | Component | Notes |
| --- | --- | --- |
| Hero | `CloudSubHero` (new adapter) | One H1, outcome, contact and process anchors; existing hero styles, decorative gradient fallback. |
| Signs it is time to plan your cloud move | `DraftCardSection` (new) | 4 items. |
| Our cloud architecture services | `DraftCardSection` (new) | 4 items; authored service scope. |
| Our cloud migration services | `DraftCardSection` (new) | 4 items; authored service scope. |
| Our migration process | `ServicePillarApproach` (existing, unchanged) | 6 steps; HowTo uses the exact visible step copy. |
| Sample migration architecture | `DraftArchitectureDiagram` (new) | Semantic HTML figure with a descriptive caption; illustrative, no vendor logos. |
| Cloud platforms for your migration | `ServiceTools` (existing, unchanged; explicit text descriptions) | AWS, Azure and Google Cloud text only. |
| What a well-planned migration can improve | `DraftCardSection` (new) | Qualitative only; no project numbers available. |
| Case study | `ServiceCaseStudyGallery` (existing, conditional) | Hidden: no matching cloud project in the existing feed. |
| Choose the right starting point | `DraftCardSection` (new) | Three engagement options; confirm commercial scope. |
| Related insights | `RelatedBlogCard` (existing, conditional) | Hidden: no eligible topic posts distinct from the pillar. |
| Frequently asked questions | `FaqContent` (existing, unchanged) | Six answers; each has two to four sentences; FAQPage uses identical data. |
| Keep building your cloud foundation | `DraftCardSection` (new) | Other two Cloud pages plus the existing relevant Data/Analytics sub-page. |
| Final contact | `ContactCta` (existing, unchanged) | One existing contact form; submission and validation unchanged. |

### DevOps & Reliability

Route: `/services/cloud-foundations/devops-reliability`

| Section, in display order | Component | Notes |
| --- | --- | --- |
| Hero | `CloudSubHero` (new adapter) | One H1, outcome, contact and process anchors; existing hero styles, decorative gradient fallback. |
| Signs your delivery process needs attention | `DraftCardSection` (new) | 4 items. |
| Our DevOps services | `DraftCardSection` (new) | 4 items; authored service scope. |
| Our reliability services | `DraftCardSection` (new) | 5 items; authored service scope. |
| Our DevOps and reliability process | `ServicePillarApproach` (existing, unchanged) | 4 steps; No HowTo schema. |
| Sample DevOps pipeline | `DraftArchitectureDiagram` (new) | Semantic HTML figure with a descriptive caption; illustrative, no vendor logos. |
| Tools we use | `DraftToolLinks` (new) | Eight text links to the existing Technologies page. |
| Measure the operating changes that matter | `DraftCardSection` (new) | Qualitative only; no project numbers available. |
| Case study | `ServiceCaseStudyGallery` (existing, conditional) | Hidden: no matching cloud project in the existing feed. |
| Start with the problem you need to solve | `DraftCardSection` (new) | Three engagement options; confirm commercial scope. |
| Related insights | `RelatedBlogCard` (existing, conditional) | Hidden: no eligible topic posts distinct from the pillar. |
| Frequently asked questions | `FaqContent` (existing, unchanged) | Six answers; each has two to four sentences; FAQPage uses identical data. |
| Connect delivery with the rest of your cloud work | `DraftCardSection` (new) | Other two Cloud pages plus the existing relevant Data/Analytics sub-page. |
| Final contact | `ContactCta` (existing, unchanged) | One existing contact form; submission and validation unchanged. |

### Cloud Cost Optimization

Route: `/services/cloud-foundations/cloud-cost-optimization`

| Section, in display order | Component | Notes |
| --- | --- | --- |
| Hero | `CloudSubHero` (new adapter) | One H1, outcome, contact and process anchors; existing hero styles, decorative gradient fallback. |
| Why cloud bills keep growing | `DraftCardSection` (new) | 5 items. |
| Our cost optimization services | `DraftCardSection` (new) | 6 items; authored service scope. |
| FinOps: keeping costs low long-term | `DraftCardSection` (new) | 3 items; authored service scope. |
| Our cloud cost optimization process | `ServicePillarApproach` (existing, unchanged) | 4 steps; No HowTo schema. |
| Cost tools across cloud platforms | `ServiceTools` (existing, unchanged; explicit text descriptions) | AWS, Azure and Google Cloud text only. |
| Understand what changed, not just what was suggested | `DraftCardSection` (new) | Qualitative only; no project numbers available. |
| Case study | `ServiceCaseStudyGallery` (existing, conditional) | Hidden: no matching cloud project in the existing feed. |
| Choose a cost review that fits your needs | `DraftCardSection` (new) | Three engagement options; confirm commercial scope. |
| Related insights | `RelatedBlogCard` (existing, conditional) | Hidden: no eligible topic posts distinct from the pillar. |
| Frequently asked questions | `FaqContent` (existing, unchanged) | Six answers; each has two to four sentences; FAQPage uses identical data. |
| Connect cost decisions with architecture and operations | `DraftCardSection` (new) | Other two Cloud pages plus the existing relevant Data/Analytics sub-page. |
| Final contact | `ContactCta` (existing, unchanged) | One existing contact form; submission and validation unchanged. |

The optional estimator was deliberately omitted completely. Both “optimization” and “optimisation” appear naturally in body copy; URL, title, H1 and headings use US spelling.

## New components available for redesign

- `CloudSubServicePage`: the server-rendered assembler and conditional content sections, driven by one page key.
- `CloudSubHero`: a scoped hero adapter with an outcome line and image slot. It imports existing hero/button styles without editing them. The shared pillar hero has its own fixed image composition, so it was kept unchanged.
- `DraftCardSection`: the repeated signs, service offerings, FinOps, benefits/results, engagement and related-service sections. Normal container/section spacing, simple cards and theme tokens.
- `DraftArchitectureDiagram`: migration before/after and DevOps pipeline figures, with semantic lists and captions.
- `DraftToolLinks`: plain wrapping technology-name links, with no vendor logos.

The draft sections reuse existing scroll reveals. No animation library or new animation keyframes were added. Existing `Container`, process, text-platform cards, FAQ, case gallery, article card and contact form components are reused unchanged.

## Check before publishing

### Content, delivery and commercial claims

Confirm the service capabilities and delivery practices listed in the copy review appendix below. In particular, verify:

- Migration assessment, architecture, landing zones, network/security planning, workload migration, cutover/rollback, data validation and ongoing management match Vyntics delivery practice.
- AWS, Azure and Google Cloud coverage matches available team skills. These are technology names, with no partnership or certification claim.
- Terraform, CI/CD, containers, Kubernetes, DevSecOps, monitoring, logging, recovery testing and incident support are services Vyntics can provide as scoped.
- The eight DevOps tools are actually used or supported. Their links go to the existing Technologies page, with no invented anchors.
- SLA/SLO targets, escalation, operating hours, incident handling and managed support must be agreed per engagement. The copy makes no uptime or around-the-clock support promise.
- Cloud spend audits, rightsizing, commitment review, scaling, storage cleanup, dashboards and AI-based spend monitoring are available capabilities, not an existing packaged AI product.
- Monthly FinOps support and other ongoing management options are offered on the terms described.
- The plan explicitly requested “Get a free DevOps assessment” and “Get a free cloud cost audit.” Confirm those free offers and their scope before publication.
- Pricing is discussed against scope rather than a published rate. Confirm the FAQ wording about proposals and charges.
- FAQ duration and cost factors are general guidance; there are no specific schedules, prices, savings percentages or guaranteed outcomes. Validate the factors and assessment approach against actual practice.
- Benefits and outcomes are intended improvement areas. They must not be presented as achieved project results without supporting case data.

### Missing content and intentional omissions

| Page | Case study | Related insights | Numbers |
| --- | --- | --- | --- |
| Migration | Hidden; no matching published cloud migration project. | Hidden; no eligible migration article distinct from the pillar. | Benefits remain qualitative. |
| DevOps | Hidden; no matching published DevOps/reliability project. | Hidden; no eligible DevOps article distinct from the pillar. | Results describe measurements, with no performance figures. |
| Cost Optimization | Hidden; no matching published cloud cost project. | Hidden; the existing AWS cost article is already used on the pillar. | No savings percentages or cost figures. |

The inspected cloud-targeted case feed returned an AI customer-support project, not a cloud implementation, so it was excluded. The inspected blog feed returned `5-cost-optimization-strategies-for-aws-cloud-architecture`, already displayed by the pillar, so it was excluded. No new case study or blog data was created. Empty conditional sections render nothing and reserve no layout gap. Future items are selected from the existing feeds by service/topic metadata; review editorial relevance as content is added. Overlapping articles are assigned to one sub-page and pillar posts are excluded.

### Missing images

| Page | Expected file | Current fallback |
| --- | --- | --- |
| Migration | `frontend/public/image/services/cloud-migration-hero.webp` | Existing `/images/diagonal-sweep-gradient.webp`, decorative empty alt. |
| DevOps | `frontend/public/image/services/devops-reliability-hero.webp` | Same existing gradient. |
| Cost | `frontend/public/image/services/cloud-cost-optimization-hero.webp` | Same existing gradient. |

No image files or placeholder assets were created. Add the intended assets later and review the configured descriptive alt text against the actual image. Rebuild after adding them so metadata also picks up the assets. The diagrams are semantic HTML and need no external images.

### Links

No requested Data/Analytics link was skipped: Data Warehousing & Lakehouse, Data Pipelines & Integration, and Dashboards & Executive Reporting exist. Missing case/post links are absent together with their hidden sections. The breadcrumb's Services destination is the existing home `/#services` anchor because the standalone `/services` route is not the current architecture. There are no invented routes.

### Technical facts checked against primary documentation

Migration approach descriptions were checked against [AWS migration strategies](https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html), [Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/migrate-services-overview?view=migrate) and [Google Cloud Migration Center](https://docs.cloud.google.com/migration-center/docs/migration-center-overview). Monitoring concepts were checked against [Google's SRE monitoring chapter](https://sre.google/sre-book/monitoring-distributed-systems/).

Commitment and budget descriptions were checked against [AWS Savings Plans and Reserved Instances](https://docs.aws.amazon.com/savingsplans/latest/userguide/sp-ris.html), [Azure budgets](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets) and [Google Cloud budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets). Those sources support vendor concepts, not claims about Vyntics delivery or project results.

## Verification

- Production build, TypeScript checks and lint completed. Lint has one pre-existing unused `ShinyButton` warning in Recognitions; no new lint errors.
- Existing tests: 57 passed. New Cloud sub-service tests: 6 passed, covering content/metadata limits, schema parity, HowTo scope, topic matching, article duplication and unavailable content.
- Browser checks: all three pages at 1280, 1440, 1920, 820 and 360px in light and dark themes; no horizontal overflow, clipped hero copy or broken images.
- Same-page hero links, sticky-header offsets, keyboard FAQ interaction, reduced-motion visibility and reveal-once behavior checked. The existing contact form is reused and was not submitted during QA.
- Internal page links, sitemap entries, metadata, one H1, six FAQs and structured-data types checked. Both UK cost aliases resolve to the US canonical route in the production build.
- Canonical footer links, the existing home Services anchor, and visible content with JavaScript disabled also passed.
- Cloud and Analytics pillar pages re-opened after implementation. Their desktop header/hero screenshots match the baseline pixel-for-pixel (1440px viewport, first 800px). Existing shared code/styles remained byte-for-byte unchanged; the Cloud page's only source edits are its two canonical link expressions.
- The already-running development server may need restarting to load the imported redirect configuration. Production redirect behavior was verified.

## Application files created

- `frontend/docs/cloud-sub-services-implementation.md`
- `frontend/src/app/(marketing)/services/cloud-foundations/cloud-architecture-migration/page.tsx`
- `frontend/src/app/(marketing)/services/cloud-foundations/cloud-cost-optimization/page.tsx`
- `frontend/src/app/(marketing)/services/cloud-foundations/devops-reliability/page.tsx`
- `frontend/src/components/service-sub/cloud-sub-service-page.tsx`
- `frontend/src/components/service-sub/draft-sections.tsx`
- `frontend/src/components/service-sub/hero.tsx`
- `frontend/src/components/service-sub/service-sub.module.css`
- `frontend/src/content/cloud-sub-services/assets.ts`
- `frontend/src/content/cloud-sub-services/cloud-sub-services.test.mjs`
- `frontend/src/content/cloud-sub-services/pages.ts`
- `frontend/src/content/cloud-sub-services/references.ts`
- `frontend/src/content/cloud-sub-services/seo.ts`

## Existing files changed

- `frontend/src/app/(marketing)/services/cloud/page.tsx`: canonical sub-service links only, in hero capabilities and Our cloud services.
- `frontend/src/content/service-navigation.ts`: canonical US cost slug for generated navigation links.
- `frontend/src/content/service-route-map.ts`: old UK Cloud cost URLs redirect to the canonical new page.

Browser scripts, screenshots, build logs and scope snapshots are under `frontend/.qa/`. Next's generated type import file was restored to its original contents after building. No files were deleted or renamed.

No Git operations were run. Nothing outside `frontend/` was changed.

## Copy review appendix

Review each item below against the scope Vyntics actually offers. This includes all authored descriptions of delivery, capabilities, outcomes, engagement options, timeline factors and costs, so commercial or operating assumptions are easy to identify before publishing.

### Cloud Architecture & Migration


**Hero**

- [ ] Our cloud migration services help you move applications and data with a clear cloud migration strategy, tested cutover steps, and an operating plan your team can use.
- [ ] Move with a clear plan and a tested path to production.
- [ ] Discuss your cloud migration

**Signs**

- [ ] An on-premise to cloud migration should address a business or operating constraint, not just move the same problems elsewhere.
- [ ] **Aging servers:** Hardware refreshes, unsupported software, and limited spare capacity make routine changes harder to manage.
- [ ] **Scaling limits:** Demand changes faster than your infrastructure can respond, or capacity planning depends on large purchases made well in advance.
- [ ] **High maintenance costs:** Your team spends time patching, replacing hardware, and maintaining environments that could be simpler to operate.
- [ ] **Security gaps:** Access controls, patching, backups, or recovery procedures need a more consistent approach before the next major change.

**Our cloud architecture services**

- [ ] Our cloud architecture consulting starts with your workloads, dependencies, and ownership needs. We document the choices your team and cloud solution architect need to review.
- [ ] **Well-architected design:** We map application boundaries, traffic, data flows, and service requirements before choosing compute, storage, and managed services.
- [ ] **Landing zones:** We define the account or subscription structure, environment separation, identity controls, and policies that support consistent deployment.
- [ ] **Security and network design:** We plan private connectivity, access boundaries, encryption, and network segmentation around the systems your workloads need to reach.
- [ ] **High availability and disaster recovery:** We design redundancy, backup, and recovery options against agreed business requirements, then identify what needs to be tested.

**Our cloud migration services**

- [ ] We select a migration approach for each workload. The right choice depends on application constraints, risk, and the changes your team is ready to own.
- [ ] **Rehost: lift and shift:** Move a workload with limited application changes when a straightforward infrastructure move is appropriate.
- [ ] **Replatform:** Adjust selected platform components, such as a database or application runtime, while keeping most application behavior intact.
- [ ] **Refactor:** Change application architecture where the business case supports the additional development, testing, and operational work.
- [ ] **Database and application migration:** Plan data transfer, dependency sequencing, validation, cutover, and rollback together so applications and their data move coherently.

**Process**

- [ ] We turn your cloud migration strategy into reviewable stages, with acceptance checks before workloads move into production.
- [ ] **Assess:** We inventory workloads, data, dependencies, security requirements, and operating constraints.
- [ ] **Plan:** We define the target architecture, migration sequence, acceptance checks, and rollback approach.
- [ ] **Pilot:** We test the approach on a representative workload and use the findings to refine the plan.
- [ ] **Migrate:** We move applications and data in agreed groups while tracking issues and cutover decisions.
- [ ] **Validate:** We check data integrity, application behavior, access, performance, backups, and recovery readiness.
- [ ] **Optimise:** We review resource usage, monitoring, cost, and operating documentation after the move.

**Platforms**

- [ ] We compare the fit with your existing systems, data requirements, team skills, and operating model.
- [ ] **AWS:** AWS migration services typically involve workload discovery, target account and network planning, and a suitable compute and database destination. We plan validation and operational ownership alongside the move.
- [ ] **Azure:** Azure migration services typically include readiness assessment, subscription and identity planning, and application or database migration. We review dependencies on existing Microsoft systems before choosing a destination.
- [ ] **Google Cloud:** A move to Google Cloud starts with workload discovery and dependency assessment. We compare infrastructure and managed-service options, then plan the data transfer and acceptance checks.

**Benefits/results**

- [ ] The benefits depend on your starting environment and the decisions made during the move. We review these areas against your requirements with your team.
- [ ] **Cost visibility:** Connect resource choices and usage to operating costs, including the cost of maintaining the new environment.
- [ ] **Scalability:** Choose capacity and scaling options that can respond to demand without relying only on hardware purchases.
- [ ] **Security:** Make access, network boundaries, patching responsibilities, and recovery procedures explicit and reviewable.
- [ ] **Speed of change:** Use repeatable environment setup and clearer operating documentation to make infrastructure changes easier to manage.

**Engagements**

- [ ] We agree on scope, access, responsibilities, and acceptance criteria before delivery starts.
- [ ] **Migration assessment:** Review the current environment, dependencies, risks, and destination options before committing to a migration plan.
- [ ] **Full migration:** Work through architecture, planning, pilot, migration, validation, and the agreed handoff as one scoped engagement.
- [ ] **Ongoing management:** Discuss monitoring, maintenance, incident handling, and improvement responsibilities for the migrated environment.

**Contact**

- [ ] Tell us which applications and data you want to move, what is holding the project back, and the constraints we should understand. We can discuss a practical assessment and migration scope.

**FAQ guidance and delivery assumptions**

- [ ] **How long does a cloud migration take?** A migration typically moves through discovery, planning, testing, and staged cutover. The schedule depends on workload count, data volume, dependencies, testing needs, and available change windows. We assess those factors before proposing a delivery plan.
- [ ] **How much does cloud migration cost?** Costs typically depend on assessment effort, application changes, data transfer, testing, and the target cloud services. Running old and new environments together can also affect the budget during the move. We separate delivery scope from ongoing cloud operating costs when discussing an engagement.
- [ ] **Will there be downtime during migration?** Some workloads need a cutover window, while others can support a staged transition. The practical approach depends on data consistency, application design, and the systems connected to it. We plan the change window and rollback steps rather than promising a migration without downtime.
- [ ] **How do you keep our data safe during migration?** We plan access controls, encrypted transfer, backups, and validation around your data requirements. Permissions should be limited to the people and systems involved in the move. We agree on checks for data integrity and recovery before cutover.
- [ ] **What is the difference between rehosting, replatforming and refactoring?** Rehosting moves a workload with limited application changes. Replatforming changes selected platform components while keeping much of the application intact. Refactoring changes the application architecture and typically requires more development and testing.
- [ ] **Should we choose AWS, Azure or Google Cloud?** The choice depends on your applications, existing systems, skills, security requirements, and cost model. There is no single best platform for every workload. We compare suitable options against the requirements you need to meet.

### DevOps & Reliability


**Hero**

- [ ] Our DevOps consulting services help your team make deployments repeatable, see production issues sooner, and recover with clearer operating procedures.
- [ ] Release faster, break less
- [ ] Get a free DevOps assessment

**Signs**

- [ ] The strongest reason to change your process is a recurring problem your team can identify and measure.
- [ ] **Slow manual deployments:** Releases depend on remembered commands, individual access, or a long sequence of manual checks.
- [ ] **Frequent outages:** Changes repeatedly cause incidents, and the team spends more time restoring service than addressing the underlying causes.
- [ ] **No visibility into failures:** Logs, metrics, and alerts are missing or scattered, so it is difficult to understand where a problem started.
- [ ] **Environments that do not match:** Configuration differences between development, testing, and production make release behavior hard to predict.

**Our DevOps services**

- [ ] Our CI/CD pipeline services connect code changes, checks, and deployment decisions. We use DevOps automation where it reduces repeated work and keeps the process understandable.
- [ ] **CI/CD pipelines:** We build automated build, test, and deployment steps with approval gates, release records, and a rollback approach suited to your applications.
- [ ] **Infrastructure as code:** We use Terraform where appropriate to define infrastructure in version-controlled files, review changes, and make environments more repeatable.
- [ ] **Containers and Kubernetes:** We review packaging, deployment, and scaling needs before introducing orchestration. Our Kubernetes consulting focuses on a setup your team can operate.
- [ ] **DevSecOps:** We include dependency checks, secret handling, access controls, and security review points in the delivery workflow rather than leaving them until release.

**Our reliability services**

- [ ] Our site reliability engineering services focus on the health of the service your users depend on. We agree on useful signals, response responsibilities, and recovery expectations.
- [ ] **Monitoring and alerting:** Our cloud monitoring services connect service health signals with alerts that tell the right person what needs attention.
- [ ] **Logging:** We organize logs so teams can trace a failure across services and find the information needed for investigation.
- [ ] **Uptime and SLA targets:** We define measurable service objectives with your team and review any contractual service-level targets without promising universal uptime.
- [ ] **Incident response:** We document triage, escalation, recovery, and follow-up steps so incidents produce a clearer operating response.
- [ ] **Backup and disaster recovery:** We review backup coverage, restoration procedures, and recovery tests against your business requirements.

**Process**

- [ ] We start with the current delivery path, then improve the steps that create repeated work or operational risk.
- [ ] **Audit:** We review deployments, environments, access, monitoring, and the incidents your team is trying to prevent.
- [ ] **Automate:** We introduce scoped delivery and infrastructure automation with checks, review points, and documented ownership.
- [ ] **Monitor:** We connect agreed service health signals to dashboards, alerts, and response procedures.
- [ ] **Improve:** We use release and incident findings to prioritize the next improvement with your team.

**Benefits/results**

- [ ] We agree on a starting point and review trends after changes. The measures help identify what to improve.
- [ ] **Deployment frequency:** Track how often useful changes reach production and which checks or handoffs slow the process.
- [ ] **Downtime:** Review when users cannot use the service, what caused the interruption, and whether recurring failure paths are being addressed.
- [ ] **Recovery time:** Measure how long it takes to identify and restore a failed service, then improve the response and recovery steps.

**Engagements**

- [ ] We agree on the delivery scope and operating responsibilities before selecting a support arrangement.
- [ ] **DevOps audit:** Review the current pipeline, environments, and production practices to identify a practical sequence of improvements.
- [ ] **Implementation:** Deliver the agreed pipeline, infrastructure, monitoring, or reliability changes with documentation and handoff.
- [ ] **Managed DevOps:** Discuss ongoing pipeline maintenance, monitoring, incident handling, and improvement work with explicit coverage and escalation rules.

**Contact**

- [ ] Tell us how your team deploys changes and where releases or incidents cause repeated work. We can discuss an assessment and a focused improvement scope.

- [ ] We select tools around your delivery process, application requirements, and the systems your team can maintain.
- [ ] Tools supported: GitHub Actions, Jenkins, Terraform, Docker, Kubernetes, Prometheus, Grafana, CloudWatch.

**FAQ guidance and delivery assumptions**

- [ ] **What do DevOps consulting services include?** The scope typically includes delivery pipelines, environment setup, infrastructure definitions, monitoring, and operating procedures. We focus on the gaps in your current setup rather than introducing every tool at once. The engagement defines which changes and ongoing responsibilities are included.
- [ ] **How long does it take to set up a CI/CD pipeline?** Setup typically depends on your application structure, test coverage, environments, security requirements, and release approvals. An established application with useful automated tests needs different work from a system with manual deployment steps. We review the current path before proposing a schedule.
- [ ] **What is infrastructure as code and why does it matter?** Infrastructure as code describes infrastructure in files that can be versioned and reviewed. It helps teams reproduce environments and understand the changes made to them. It still needs access controls, change review, and a way to handle differences between the recorded configuration and the running environment.
- [ ] **What is site reliability engineering (SRE)?** Site reliability engineering applies engineering practices to operating dependable services. It commonly uses service objectives, monitoring, incident learning, and automation to balance reliability with the need to release changes. We adapt those practices to the size and operating needs of your team.
- [ ] **Do we need Kubernetes?** Not every application needs Kubernetes. It can be useful when orchestration requirements justify the additional operating work, but simpler hosting options may fit your team better. We compare the deployment needs and ownership effort before recommending it.
- [ ] **Can you provide ongoing monitoring and support?** We can discuss ongoing monitoring, maintenance, and incident support as a separate operating scope. Coverage hours, response expectations, escalation, and ownership need to be agreed for your environment. A managed engagement should make those responsibilities explicit.

### Cloud Cost Optimization


**Hero**

- [ ] Our cloud cost optimization services help you reduce cloud costs by connecting your bill to resource usage, ownership, and the performance your applications need.
- [ ] Pay only for the cloud you actually use
- [ ] Get a free cloud cost audit

**Signs**

- [ ] A rising bill can reflect real demand, avoidable waste, or a mix of both. We investigate the reasons before changing resources.
- [ ] **Idle resources:** Unused development environments or resources with little activity continue to generate charges.
- [ ] **Oversized instances:** Capacity was chosen for a peak or an early estimate, but actual usage no longer supports that size.
- [ ] **No tagging or visibility:** Costs cannot be tied consistently to a team, workload, environment, or owner.
- [ ] **Unused storage:** Old snapshots, unattached volumes, or stored data remain without a reviewed retention or ownership decision.
- [ ] **Missed discounts:** Eligible, predictable usage is not reviewed against commitment options, or existing commitments no longer fit demand.

**Our cost optimization services**

- [ ] We review the cloud cost management decisions that drive your bill. We can also build AI tools that monitor your cloud spend and flag possible waste for human review.
- [ ] **Cloud cost audit:** We connect billing data, resource inventory, usage, and ownership to identify the areas worth investigating.
- [ ] **Rightsizing:** We compare resource capacity with usage and performance requirements before proposing smaller or different configurations.
- [ ] **Reserved instances and savings plans:** We review eligible usage, commitment coverage, and expected demand before considering a purchasing commitment.
- [ ] **Auto-scaling:** We review scaling policies, thresholds, and minimum capacity so the environment responds to demand within agreed service limits.
- [ ] **Storage cleanup:** We review ownership, retention, access needs, and recovery requirements before removing or changing stored data.
- [ ] **Cost dashboards and alerts:** We make spend easier to review by workload and team, with alerts that prompt owners to investigate changes in usage.

**FinOps: keeping costs low long-term**

- [ ] FinOps consulting connects financial decisions with engineering ownership. Our cloud cost optimisation review helps your team build a repeatable habit of checking usage, cost, and business need.
- [ ] **Budgets:** We define useful spending thresholds and review points. Budget alerts notify owners; they do not automatically stop all cloud spending.
- [ ] **Tagging:** We agree on workload, environment, and ownership labels so cost reports can support decisions and follow-up.
- [ ] **Team-level cost reports:** We connect usage and spend with responsible teams, explain material changes, and record who will act on them.

**Process**

- [ ] We separate low-risk changes from decisions that need workload testing, financial review, or a longer operating view.
- [ ] **Audit:** We review billing, resource inventory, usage patterns, ownership, and current commitments.
- [ ] **Quick wins:** We prioritize changes with clear ownership and limited operational risk, then validate their effect.
- [ ] **Long-term savings:** We assess resource design, scaling, retention, and commitment options against expected demand.
- [ ] **Ongoing monitoring:** We establish reporting and review points so owners can investigate new cost changes.

**Platforms**

- [ ] We use the billing and usage information available in your cloud environment to support an AWS cost optimization or Azure cost optimization review, or a Google Cloud cost review.
- [ ] **AWS:** AWS Cost Explorer and billing reports can help investigate spend and evaluate eligible commitments. We connect that information with workload usage and resource ownership before proposing changes.
- [ ] **Azure:** Azure Cost Management supports cost analysis and budget alerts. We review costs alongside resource utilization, ownership, and the limits your applications need to operate within.
- [ ] **Google Cloud:** Cloud Billing reports and budgets help teams review spend and investigate changes. We relate those views to projects, workload owners, and resource decisions; budget alerts alone do not cap usage.

**Benefits/results**

- [ ] Savings depend on your environment, usage, existing commitments, and the changes your team can safely make. We compare actual costs and workload behavior without assuming a fixed savings percentage.
- [ ] **Less avoidable waste:** Review unused resources, excess capacity, and retention choices against the needs of each workload.
- [ ] **Clearer ownership:** Give teams a useful view of the costs they influence and the recommendations they need to review.
- [ ] **Performance-aware decisions:** Check resource changes against service requirements so a lower bill is not the only acceptance measure.

**Engagements**

- [ ] We discuss access, scope, reporting needs, and approval responsibilities before starting work.
- [ ] **One-time audit:** Review the bill and usage data, then receive a prioritized set of findings to discuss with your team.
- [ ] **Optimization project:** Work through agreed resource, configuration, reporting, or commitment changes with validation and ownership checks.
- [ ] **Monthly FinOps support:** Discuss a recurring cost review, reporting, and follow-up arrangement that fits your workload and team responsibilities.

**Contact**

- [ ] Tell us which cloud platforms you use and where the bill is becoming difficult to understand. We can discuss a cost audit and the information needed to scope a useful review.

**FAQ guidance and delivery assumptions**

- [ ] **How much can we save on our cloud bill?** Potential savings depend on current usage, resource sizing, retention, purchasing commitments, and your performance requirements. An environment with little avoidable waste has a different starting point from one with unused resources. We review the evidence before discussing opportunities and do not promise a savings percentage.
- [ ] **Will cost optimization affect performance?** A resource change can affect performance if it is made without understanding the workload. We review usage and service requirements, then plan validation and a recovery path for agreed changes. Cost reduction should be assessed alongside application behavior and reliability.
- [ ] **What is FinOps?** FinOps is a way for engineering, finance, and business teams to share responsibility for cloud spending. It combines cost visibility, ownership, planning, and regular review. The aim is to connect spending decisions with business needs rather than treat every cost as waste.
- [ ] **How long does a cloud cost audit take?** An audit typically depends on the number of accounts or subscriptions, billing access, tagging quality, and the range of services in use. Historical usage and workload context also affect the review. We agree on the audit scope before proposing a schedule.
- [ ] **What are reserved instances and savings plans?** These are cloud purchasing options that can reduce eligible usage charges in exchange for a commitment. On AWS, Reserved Instances apply to specified instance configurations, while Savings Plans use a spending commitment for eligible usage. The right choice depends on demand, eligibility, and how much flexibility you need.
- [ ] **How do you charge for cost optimization?** We discuss the fee and scope for an audit, implementation project, or ongoing support before work begins. The proposal depends on the environment, access, analysis, and delivery responsibilities involved. Your cloud provider charges and any purchasing commitments are separate from our consulting scope.
