import test from 'node:test';
import assert from 'node:assert/strict';
import { serviceSitemap } from './service-sitemap.ts';
import { legacyServiceRoutes, canonicalServiceHref } from './service-route-map.ts';
import { platformServices } from './platform-services.ts';

const destinations = new Set(['/services', ...serviceSitemap.flatMap(pillar => [
  `/services/${pillar.slug}`, ...pillar.services.map(service => `/services/${pillar.slug}/${service.slug}`),
])]);

const platformGroupToPillar = {
  cloud: 'cloud-foundations',
  data: 'data-engineering',
  analytics: 'analytics-bi',
  ai: 'ai-solutions',
  crm: 'crm-revenue-ops',
};

test('canonical service architecture has exactly five pillars and thirteen unique services', () => {
  assert.equal(serviceSitemap.length, 5);
  assert.equal(serviceSitemap.flatMap(pillar => pillar.services).length, 13);
  assert.equal(destinations.size, 19);
  assert.deepEqual(serviceSitemap.map(pillar => pillar.slug), ['cloud-foundations', 'data-engineering', 'analytics-bi', 'ai-solutions', 'crm-revenue-ops']);
});

test('every mapped legacy content source redirects directly to its canonical service', () => {
  for (const pillar of serviceSitemap) for (const service of pillar.services) for (const source of service.sources) {
    assert.equal(legacyServiceRoutes[`/services/${source.group}/${source.slug}`], `/services/${pillar.slug}/${service.slug}`);
  }
});

test('all redirects target existing canonical URLs without chains or loops', () => {
  for (const [source, destination] of Object.entries(legacyServiceRoutes)) {
    assert.ok(destinations.has(destination), destination);
    assert.notEqual(source, destination);
    assert.equal(legacyServiceRoutes[destination], undefined);
  }
});

test('cloud aliases and old analytics anchor resolve to appropriate canonical pages', () => {
  assert.equal(canonicalServiceHref('/services/cloud/architecture'), '/services/cloud-foundations/cloud-architecture-migration');
  assert.equal(canonicalServiceHref('/services/cloud/migration'), '/services/cloud-foundations/cloud-architecture-migration');
  assert.equal(canonicalServiceHref('/services/data#offering-4'), '/services/analytics-bi');
  assert.equal(canonicalServiceHref('/services/data/data-quality#contact'), '/services/data-engineering/data-quality-governance#contact');
});

test('unmapped legacy services are retained rather than assigned invented redirects', () => {
  for (const href of ['/services/other', '/services/ai/llm-integrations']) {
    assert.equal(legacyServiceRoutes[href], undefined);
    assert.equal(canonicalServiceHref(href), href);
  }
});

test('canonical service content uses the navbar names in every child-service heading', () => {
  for (const [group, services] of Object.entries(platformServices)) {
    const pillar = serviceSitemap.find(item => item.slug === platformGroupToPillar[group]);
    assert.ok(pillar, `Missing navbar pillar for ${group}`);
    assert.deepEqual(Object.keys(services), pillar.services.map(service => service.slug));

    for (const [slug, service] of Object.entries(services)) {
      const navbarService = pillar.services.find(item => item.slug === slug);
      assert.ok(navbarService, `Missing navbar service for ${group}/${slug}`);
      assert.equal(service.name, navbarService.name);
      assert.ok(service.title.startsWith(navbarService.name), `${slug} heading must start with ${navbarService.name}`);
    }
  }
});

test('every related-service card uses a navbar name and an existing canonical route', () => {
  const catalog = new Map(serviceSitemap.flatMap(pillar => [
    [`/services/${pillar.slug}`, pillar.name],
    ...pillar.services.map(service => [`/services/${pillar.slug}/${service.slug}`, service.name]),
  ]));

  for (const services of Object.values(platformServices)) for (const service of Object.values(services)) {
    const related = [...(service.dataPage?.relatedServices ?? []), ...(service.aiPage?.relatedServices ?? [])];
    for (const item of related) assert.equal(catalog.get(item.href), item.name, `${service.slug}: ${item.href}`);
  }
});
