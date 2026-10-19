import json,pathlib
pages=json.load(open('.qa/cloud-sub-content.json'))
print(type(pages),pages.keys())
text='''# Cloud Foundations sub-service implementation

Three new pages use authored, data-driven copy and minimal draft section layouts. The existing pillar layouts, shared components, shared styles, header, footer, contact form and API contracts are unchanged. Only their route/link registrations were updated.

## Existing site inspected before implementation

Cloud Foundations and Analytics & BI were opened in the browser and their source components inspected.

| Section | Existing component | Data and location |
| --- | --- | --- |
| Hero | `ServicesHero` | Inline Cloud props and `canonical-cloud-services.ts`; Analytics `analytics-bi-content.ts`. Shared hero visuals come from `src/content/service-hero-visuals.ts`. |
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
'''
common={'signs':'`DraftCardSection` (new)','offer':'`DraftCardSection` (new)','process':'`ServicePillarApproach` (existing, unchanged)','diagram':'`DraftArchitectureDiagram` (new)','platform':'`ServiceTools` (existing, unchanged; explicit text descriptions)','tools':'`DraftToolLinks` (new)','results':'`DraftCardSection` (new)','case':'`ServiceCaseStudyGallery` (existing, conditional)','engage':'`DraftCardSection` (new)','insight':'`RelatedBlogCard` (existing, conditional)','faq':'`FaqContent` (existing, unchanged)','related':'`DraftCardSection` (new)','contact':'`ContactCta` (existing, unchanged)'}
for key,p in pages.items():
 text+=f'### {p["name"]}\n\nRoute: `/services/cloud-foundations/{p["slug"]}`\n\n| Section, in display order | Component | Notes |\n| --- | --- | --- |\n'
 rows=[('Hero','`CloudSubHero` (new adapter)','One H1, outcome, contact and process anchors; existing hero styles, decorative gradient fallback.'),(p['signs']['title'],common['signs'],str(len(p['signs']['items']))+' items.')]
 rows += [(x['title'],common['offer'],str(len(x['items']))+' items; authored service scope.') for x in p['offerings']]
 rows += [(p['process']['title'],common['process'],str(len(p['process']['steps']))+' steps; '+('HowTo uses the exact visible step copy.' if key=='migration' else 'No HowTo schema.'))]
 if p.get('diagram'):rows.append((p['diagram']['title'],common['diagram'],'Semantic HTML figure with a descriptive caption; illustrative, no vendor logos.'))
 if p.get('platforms'):rows.append((p['platforms']['title'],common['platform'],'AWS, Azure and Google Cloud text only.'))
 if p.get('tools'):rows.append(('Tools we use',common['tools'],'Eight text links to the existing Technologies page.'))
 rows += [(p['results']['title'],common['results'],'Qualitative only; no project numbers available.'),('Case study',common['case'],'Hidden: no matching cloud project in the existing feed.'),(p['engagements']['title'],common['engage'],'Three engagement options; confirm commercial scope.'),('Related insights',common['insight'],'Hidden: no eligible topic posts distinct from the pillar.'),('Frequently asked questions',common['faq'],'Six answers; each has two to four sentences; FAQPage uses identical data.'),(p['related']['title'],common['related'],'Other two Cloud pages plus the existing relevant Data/Analytics sub-page.'),('Final contact',common['contact'],'One existing contact form; submission and validation unchanged.')]
 for a,b,c in rows:text+=f'| {a} | {b} | {c} |\n'
 if key=='cost':text+='\nThe optional estimator was deliberately omitted completely. Both “optimization” and “optimisation” appear naturally in body copy; URL, title, H1 and headings use US spelling.\n'
 text+='\n'
text+='''## New components available for redesign

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
- Cloud and Analytics pillar pages re-opened after implementation. Existing shared code/styles remained byte-for-byte unchanged; the Cloud page's only source edits are its two canonical link expressions.
- The already-running development server may need restarting to load the imported redirect configuration. Production redirect behavior was verified.

## Application files created

'''
new=[*pathlib.Path('src/content/cloud-sub-services').glob('*'),*pathlib.Path('src/components/service-sub').glob('*')]
for slug in [p['slug'] for p in pages.values()]:new.append(pathlib.Path('src/app/(marketing)/services/cloud-foundations')/slug/'page.tsx')
new.append(pathlib.Path('docs/cloud-sub-services-implementation.md'))
for p in sorted(new):text+=f'- `frontend/{p}`\n'
text+='''
## Existing files changed

- `frontend/src/app/(marketing)/services/cloud/page.tsx`: canonical sub-service links only, in hero capabilities and Our cloud services.
- `frontend/src/content/service-navigation.ts`: canonical US cost slug for generated navigation links.
- `frontend/src/content/service-route-map.ts`: old UK Cloud cost URLs redirect to the canonical new page.

Browser scripts, screenshots, build logs and scope snapshots are under `frontend/.qa/`. Next's generated type import file was restored to its original contents after building. No files were deleted or renamed.

No Git operations were run. Nothing outside `frontend/` was changed.

## Copy review appendix

Review each item below against the scope Vyntics actually offers. This includes all authored descriptions of delivery, capabilities, outcomes, engagement options, timeline factors and costs, so commercial or operating assumptions are easy to identify before publishing.
'''
for key,p in pages.items():
 text+=f'\n### {p["name"]}\n\n'
 for label,val in [('Hero',p['hero']),('Signs',p['signs'])]+[(x['title'],x) for x in p['offerings']]+[('Process',p['process'])]+([('Platforms',p['platforms'])] if p.get('platforms') else [])+[('Benefits/results',p['results']),('Engagements',p['engagements']),('Contact',p['contact'])]:
  text+=f'\n**{label}**\n\n'
  for f in ['introduction','outcome','cta']:
   if val.get(f):text+=f'- [ ] {val[f]}\n'
  for item in val.get('items',val.get('steps',[])):text+=f'- [ ] **{item.get("title",item.get("name"))}:** {item["description"]}\n'
 if p.get('tools'):text+='\n- [ ] Tools supported: '+', '.join(p['tools'])+'.\n'
 text+='\n**FAQ guidance and delivery assumptions**\n\n'
 for q in p['faqs']:text+=f'- [ ] **{q["question"]}** {q["answer"]}\n'
pathlib.Path('docs/cloud-sub-services-implementation.md').write_text(text)
