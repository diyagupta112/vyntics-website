import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
function load(name, overrides = {}) {
  const file = new URL(name, import.meta.url);
  const output = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const compiledModule = { exports: {} };
  new Function('require', 'module', 'exports', output)(id => overrides[id] ?? require(id), compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
const { cloudSubPages } = load('./pages.ts');
const { cloudSubStructuredData, cloudSubMetadata } = load('./seo.ts', { './assets': { resolveSubHeroImage: () => ({ src: '/images/diagonal-sweep-gradient.webp', alt: '' }) } });
const { selectCloudStudies, selectCloudInsights, getCloudReferences, resolveCloudReferenceSections } = load('./references.ts', {
  './sections': load('./sections.ts'),
  '@/lib/related-services': { getItemsForService: (items, service) => items.filter(item => item.related_service === service || item.related_service === 'all' || item.related_service === 'all_services') },
  react: { cache: fn => fn },
  '@/lib/case-studies': { getCaseStudies: async () => { throw new Error('Unavailable'); } },
  '@/lib/blogs': { getBlogs: async () => ({ status: 'error', blogs: [] }) },
});
for (const page of Object.values(cloudSubPages)) {
  test(`${page.key}: metadata and schema reflect visible content`, () => {
    const meta = cloudSubMetadata(page), graph = cloudSubStructuredData(page)['@graph'];
    assert.ok(meta.title.absolute.length < 60);
    assert.ok(meta.description.length < 155);
    assert.ok(page.hero.title.toLowerCase().includes(page.keyword.toLowerCase()));
    assert.ok(page.hero.introduction.toLowerCase().includes(page.keyword.toLowerCase()));
    const faq = graph.find(x => x['@type'] === 'FAQPage');
    assert.equal(faq.mainEntity.length, 6);
    assert.deepEqual(faq.mainEntity.map(x => x.acceptedAnswer.text), page.faqs.map(x => x.answer));
    for (const f of page.faqs) assert.ok(f.answer.split(/(?<=[.!?])\s+/).length >= 2 && f.answer.split(/(?<=[.!?])\s+/).length <= 4);
    const howTo = graph.find(x => x['@type'] === 'HowTo');
    if (page.key === 'migration') assert.deepEqual(howTo.step.map(x => x.text), page.process.steps.map(x => x.description));
    else assert.equal(howTo, undefined);
    const { title, introduction, outcome, cta, imageAlt } = page.hero;
    const heroCopy = { title, introduction, outcome, cta, imageAlt };
    assert.ok(!/[—!]|\d|\b(?:guaranteed|partnership)\b/i.test(JSON.stringify({ hero: heroCopy, sections: [...page.offerings, page.results, page.engagements], faqs: page.faqs })));
  });
}
test('Cost Optimization page uses the planned content, links, and local imagery', () => {
  const page = cloudSubPages.cost;
  assert.equal(page.hero.expectedImage, '/images/services/our-services-section/cloud-cost-optimization.png');
  assert.ok(existsSync(new URL(`../../../public${page.hero.expectedImage}`, import.meta.url)));
  assert.ok(existsSync(new URL('../../../public/images/services/sub-services/benefits/cloud-cost-optimization.jpg', import.meta.url)));
  assert.deepEqual(page.signs.items.map(item => item.title), ['Idle resources', 'Oversized instances', 'No tagging or visibility', 'Unused storage', 'Missed discounts']);
  assert.deepEqual(page.offerings[0].items.map(item => item.title), ['Cloud cost audit', 'Rightsizing', 'Reserved instances and savings plans', 'Auto-scaling', 'Storage cleanup', 'Cost dashboards and alerts']);
  assert.deepEqual(page.process.steps.map(step => step.title), ['Audit', 'Quick wins', 'Long-term savings', 'Ongoing monitoring']);
  assert.deepEqual(page.platforms.items.map(item => item.name), ['AWS', 'Azure', 'Google Cloud']);
  assert.deepEqual(page.engagements.items.map(item => item.title), ['One-time audit', 'Optimization project', 'Monthly FinOps support']);
  assert.deepEqual(page.faqs.map(item => item.question), [
    'How much can we save on our cloud bill?',
    'Will cost optimization affect performance?',
    'What is FinOps?',
    'How long does a cloud cost audit take?',
    'What are reserved instances and savings plans?',
    'How do you charge for cost optimization?',
  ]);
  assert.deepEqual(page.related.items.map(item => item.href), [
    '/services/cloud-foundations/cloud-architecture-migration',
    '/services/cloud-foundations/devops-reliability',
  ]);
});
test('Cloud project selection excludes global AI projects and unrelated cloud work', () => {
  const base = { tags: [], tech_stack: [], related_service: 'all' };
  const studies = [
    { ...base, slug: 'ai', title: 'AI-powered customer support assistant', excerpt: 'Answers from product documentation.' },
    { ...base, slug: 'move', title: 'Application migration to AWS', excerpt: 'Moving workloads to the cloud.' },
    { ...base, slug: 'cost', title: 'AWS cloud cost optimization', excerpt: 'Reviewing cloud spend.' },
  ];
  assert.deepEqual(selectCloudStudies(studies, 'migration').map(x => x.slug), ['move']);
  assert.deepEqual(selectCloudStudies(studies, 'devops'), []);
  assert.deepEqual(selectCloudStudies(studies, 'cost').map(x => x.slug), ['cost']);
});
test('Insights exclude pillar posts and assign overlapping topics only once', () => {
  const base = { category: 'Cloud', related_service: 'cloud_foundations', excerpt: '', status: 'published' };
  const posts = [0, 1, 2].map(i => ({ ...base, slug: `pillar-${i}`, title: 'Cloud migration guide' })).concat([
    { ...base, slug: 'migration', title: 'AWS migration planning' },
    { ...base, slug: 'overlap', title: 'Cloud migration cost optimization' },
    { ...base, slug: 'delivery', title: 'DevOps deployment pipeline' },
    { ...base, slug: 'draft', title: 'AWS migration checklist', status: 'draft' },
  ]);
  const selections = Object.keys(cloudSubPages).flatMap(key => selectCloudInsights(posts, key));
  assert.deepEqual(new Set(selections.map(x => x.slug)), new Set(['migration', 'overlap', 'delivery']));
  assert.equal(new Set(selections.map(x => x.slug)).size, selections.length);
});
test('Unavailable feeds yield no fabricated projects or articles', async () => {
  const references = await getCloudReferences();
  assert.deepEqual(references, { studies: [], posts: [], recentStudies: [], recentPosts: [] });
  for (const key of Object.keys(cloudSubPages)) {
    const result = resolveCloudReferenceSections(references, key);
    assert.equal(result.studiesState, 'empty');
    assert.equal(result.insightsState, 'empty');
  }
});
test('Recent fallback prefers other published items and keeps chronological order', () => {
  const study = (slug, day) => ({ slug, published_at: `2026-10-${day}T00:00:00Z`, title: 'Project', excerpt: '', tags: [], tech_stack: [] });
  const post = (slug, day) => ({ slug, published_at: `2026-10-${day}T00:00:00Z`, title: 'Article', category: 'General', excerpt: '', status: 'published' });
  const studies = [study('pillar', '14')], posts = [post('pillar', '14')];
  const result = resolveCloudReferenceSections({ studies, posts, recentStudies: [...studies, study('older', '10'), study('newer', '12')], recentPosts: [...posts, post('older', '10'), post('newer', '12'), post('middle', '11')] }, 'migration');
  assert.equal(result.studiesState, 'recent');
  assert.equal(result.insightsState, 'recent');
  assert.deepEqual(result.studies.map(x => x.slug), ['newer', 'older']);
  assert.deepEqual(result.insights.map(x => x.slug), ['newer', 'middle', 'older']);
});
test('Relevant items take priority, including a pillar article when no alternative exists', () => {
  const post = { slug: 'aws-cost', published_at: '2026-10-14T00:00:00Z', title: 'AWS cost optimization', category: 'Cloud', excerpt: '', related_service: 'cloud_foundations', status: 'published' };
  const study = { slug: 'migration', published_at: '2026-10-14T00:00:00Z', title: 'Migration project', excerpt: '', tags: ['Cloud migration'], tech_stack: [] };
  const references = { studies: [study], posts: [post], recentStudies: [study], recentPosts: [post] };
  const result = resolveCloudReferenceSections(references, 'cost');
  assert.equal(result.insightsState, 'relevant');
  assert.deepEqual(result.insights.map(x => x.slug), ['aws-cost']);
  assert.equal(resolveCloudReferenceSections(references, 'migration').studiesState, 'relevant');
});
test('DevOps strict references include only published cloud/global content relevant to DevOps', () => {
  const study = (slug, related_service, title = 'DevOps deployment reliability project') => ({ id: slug, slug, related_service, published_at: '2026-10-14T00:00:00Z', title, excerpt: 'CI/CD and incident response practices.', tags: ['DevOps'], tech_stack: [] });
  const post = (slug, related_service, status = 'published', title = 'A practical CI/CD guide') => ({ id: slug, slug, related_service, status, published_at: '2026-10-14T00:00:00Z', title, category: 'DevOps', excerpt: 'Delivery pipeline and reliability practices.' });
  const references = {
    studies: [study('devops-cloud', 'cloud_foundations'), study('devops-global', 'all_services'), study('devops-other', 'crm_revenue_ops')],
    posts: [post('pillar-cloud', 'cloud_foundations', 'published', 'Cloud foundations overview'), post('pillar-global', 'all_services', 'published', 'Cloud services guide'), post('pillar-other', 'crm_revenue_ops', 'published', 'DevOps CRM deployment')],
    recentStudies: [study('recent-other', null, 'DevOps recent project')],
    recentPosts: [post('devops-pillar', 'cloud_foundations'), post('devops-global', 'all_services'), post('devops-other', 'crm_revenue_ops'), post('devops-draft', 'cloud_foundations', 'draft')],
  };
  const selected = resolveCloudReferenceSections(references, 'devops', { strictRelevance: true });
  assert.deepEqual(selected.studies.map(item => item.slug), ['devops-cloud']);
  assert.deepEqual(selected.insights.map(item => item.slug), ['devops-pillar', 'devops-global']);
});
test('Cost strict references include only published cloud/global content relevant to cost optimization', () => {
  const study = (slug, related_service, title = 'Cloud cost optimization review') => ({ id: slug, slug, related_service, published_at: '2026-10-14T00:00:00Z', title, excerpt: 'Cloud spend and rightsizing decisions.', tags: ['Cost optimization'], tech_stack: [] });
  const post = (slug, related_service, status = 'published', title = 'A practical FinOps guide') => ({ id: slug, slug, related_service, status, published_at: '2026-10-14T00:00:00Z', title, category: 'Cloud cost management', excerpt: 'Review cloud spend and savings plans.' });
  const references = {
    studies: [study('cost-cloud', 'cloud_foundations'), study('cost-global', 'all_services'), study('cost-other', 'crm_revenue_ops')],
    posts: [post('pillar-cost', 'cloud_foundations'), post('pillar-global', 'all_services'), post('pillar-other', 'crm_revenue_ops')],
    recentStudies: [study('recent-other', null)],
    recentPosts: [post('cost-published', 'cloud_foundations'), post('cost-global', 'all_services'), post('cost-other', 'crm_revenue_ops'), post('cost-draft', 'cloud_foundations', 'draft')],
  };
  const selected = resolveCloudReferenceSections(references, 'cost', { strictRelevance: true });
  assert.deepEqual(selected.studies.map(item => item.slug), ['cost-cloud']);
  assert.deepEqual(selected.insights.map(item => item.slug), ['cost-published', 'cost-global']);
});
