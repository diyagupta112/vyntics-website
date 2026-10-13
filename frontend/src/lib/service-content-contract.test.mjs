import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { getItemsForService, serviceContentPath } from "./related-services.ts";
import { getCaseStudies } from "./case-studies.ts";
import { getBlogs } from "./blogs.ts";

process.env.API_BASE_URL = "https://api.example.test";
const services = ["cloud_foundations", "data_engineering", "analytics_bi", "ai_solutions", "crm_revenue_ops"];
const study = { id: "study", slug: "study", title: "Study", client_name: "Client", excerpt: "Summary", cover_image_url: "https://example.test/cover.jpg", tech_stack: [], tags: [], featured: false, related_service: "all", published_at: "2026-10-01T00:00:00Z" };
const blog = { id: "blog", slug: "blog", title: "Blog", author: "Author", category: "Category", excerpt: "Summary", cover_image_url: "https://example.test/cover.jpg", read_time: 3, related_service: "all", published_at: "2026-10-01T00:00:00Z" };

for (const service of services) {
  test(`${service} includes exact matches and global items once for both resources`, async () => {
    const targets = [service, "all", "all_services", ...services.filter(value => value !== service), null, undefined, "", "unknown"];
    const records = base => targets.map((related_service, index) => ({ ...base, id: `${base.id}-${index}`, slug: `${base.slug}-${index}`, related_service }));
    const studies = records(study);
    const blogs = records(blog);
    const expectedStudies = studies.slice(0, 3);
    const expectedBlogs = blogs.slice(0, 3);
    const before = structuredClone(studies);
    assert.deepEqual(getItemsForService([...studies, studies[0], { ...studies[0], id: "duplicate-slug" }], service), expectedStudies);
    assert.deepEqual(studies, before, "filter must not mutate source records");
    let calls = 0;
    globalThis.fetch = async url => {
      calls++;
      const items = url.includes("/blogs") ? blogs : studies;
      return new Response(JSON.stringify({ data: [...items, items[0]] }));
    };
    assert.deepEqual(await getCaseStudies(service), expectedStudies);
    assert.deepEqual((await getBlogs(service)).blogs, expectedBlogs);
    assert.equal(calls, 2, "one request per resource");
  });
  test(`${service} handles globals only, no relevant records, and service errors`, async () => {
    assert.deepEqual(getItemsForService([{ ...study, related_service: "all" }], service), [study]);
    assert.deepEqual(getItemsForService([{ ...study, related_service: null }], service), []);
    globalThis.fetch = async () => new Response('{"data":[]}');
    assert.deepEqual(await getCaseStudies(service), []);
    assert.deepEqual(await getBlogs(service), { status: "success", blogs: [] });
    globalThis.fetch = async () => new Response("unavailable", { status: 503 });
    await assert.rejects(getCaseStudies(service), error => error.status === 503);
    assert.deepEqual(await getBlogs(service), { status: "error", blogs: [] });
  });
  test(`${service} requests backend targeting for both resources`, async () => {
    const calls = [];
    globalThis.fetch = async (url) => {
      calls.push(url);
      return new Response(JSON.stringify({ data: url.includes("/blogs") ? [blog] : [study] }));
    };
    assert.deepEqual(await getCaseStudies(service), [study]);
    assert.deepEqual((await getBlogs(service)).blogs, [blog]);
    assert.deepEqual(calls, [
      `https://api.example.test/case-studies?related_service=${service}`,
      `https://api.example.test/blogs?related_service=${service}`,
    ]);
  });
}

test("unfiltered listing paths remain unchanged", () => {
  assert.equal(serviceContentPath("/blogs"), "/blogs");
  assert.equal(serviceContentPath("/case-studies"), "/case-studies");
});

test("unscoped main listings keep all records, including unassigned and other services", async () => {
  const blogs = [blog, { ...blog, id: "unassigned", slug: "unassigned", related_service: null }, { ...blog, id: "other", slug: "other", related_service: "crm_revenue_ops" }];
  const studies = blogs.map(item => ({ ...study, id: item.id, slug: item.slug, related_service: item.related_service }));
  globalThis.fetch = async url => new Response(JSON.stringify({ data: url.includes("/blogs") ? blogs : studies }));
  assert.deepEqual(await getCaseStudies(), studies);
  assert.deepEqual((await getBlogs()).blogs, blogs);
});

test("service Blogs never use the development preview that includes drafts", async () => {
  const oldNode = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  process.env.API_BASE_URL = "http://localhost:8000";
  try {
    let requested;
    globalThis.fetch = async url => { requested = url; return new Response('{"data":[]}'); };
    assert.deepEqual(await getBlogs("data_engineering"), { status: "success", blogs: [] });
    assert.equal(requested, "http://localhost:8000/blogs?related_service=data_engineering");
  } finally {
    process.env.API_BASE_URL = "https://api.example.test";
    if (oldNode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = oldNode;
  }
});

test("all five service pages wire their exact identifier without keyword fallbacks", () => {
  for (const [page, service] of [["cloud", services[0]], ["data", services[1]], ["analytics-bi", services[2]], ["ai", services[3]], ["crm-revenue-ops", services[4]]]) {
    const source = readFileSync(new URL(`../app/(marketing)/services/${page}/page.tsx`, import.meta.url), "utf8");
    if (["data", "ai"].includes(page)) {
      assert.ok(source.includes(`<PublishedServiceCaseStudies service="${service}"`));
      assert.ok(source.includes(`<PublishedServiceBlogs service="${service}"`) || source.includes(`getBlogs("${service}")`));
      assert.ok(!source.includes("relatedInsights"));
    } else {
      assert.ok(source.includes(`getCaseStudies("${service}")`));
      assert.ok(source.includes(`getBlogs("${service}")`));
      assert.ok(!source.includes(".filter(relevant)"));
      assert.ok(!source.includes("result.data.filter"));
    }
  }
});
