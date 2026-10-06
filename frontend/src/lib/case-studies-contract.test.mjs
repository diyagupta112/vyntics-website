import assert from "node:assert/strict";
import test from "node:test";

process.env.API_BASE_URL = "https://api.test";

const { getCaseStudies, getCaseStudy, getPrimaryMedia, getCaseStudyHeroMedia, withoutHeroVideo } = await import("./case-studies.ts");

const summary = (index) => ({
  id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
  slug: `study-${index}`,
  title: `Study ${index}`,
  client_name: `Client ${index}`,
  excerpt: `Summary ${index}`,
  cover_image_url: `https://cdn.test/study-${index}.jpg`,
  tech_stack: ["TypeScript", "PostgreSQL"],
  tags: ["Data", "Automation"],
  featured: index % 2 === 0,
  published_at: "2026-10-01T00:00:00Z",
});

test("preserves every list field across multiple case studies", async () => {
  const payload = { data: Array.from({ length: 25 }, (_, index) => summary(index + 1)) };
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return new Response(JSON.stringify(payload), { status: 200 });
  };

  const studies = await getCaseStudies();

  assert.deepEqual(studies, payload.data);
  assert.equal(studies.length, 25);
  assert.deepEqual(requests, [{ url: "https://api.test/case-studies", options: { cache: "no-store" } }]);
});

test("preserves the complete nested detail content response", async () => {
  const content = {
    hero: { eyebrow: "Overview", headline: "A complete story", description: "Detail" },
    sections: [
      { type: "heading", level: 2, text: "Approach" },
      { type: "paragraph", text: "Built from backend content." },
      { type: "list", items: ["One", "Two"] },
      { type: "quote", text: "A sourced quotation." },
      { type: "image", src: "https://cdn.test/detail.jpg", caption: "System view" },
      { type: "video", video_url: "https://cdn.test/demo.mp4", poster_url: "https://cdn.test/poster.jpg" },
    ],
  };
  const payload = {
    ...summary(5),
    seo_title: "Study 5 | Vyntics",
    meta_description: "Complete metadata.",
    content,
  };
  globalThis.fetch = async () => new Response(JSON.stringify(payload), { status: 200 });

  const study = await getCaseStudy("study-5");

  assert.deepEqual(study, payload);
  assert.deepEqual(study.content, content);
  assert.deepEqual(getPrimaryMedia(study), {
    type: "video",
    src: "https://cdn.test/demo.mp4",
    poster: "https://cdn.test/poster.jpg",
  });
});

test("rejects invalid records instead of silently dropping them", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    data: [summary(1), { ...summary(2), tags: null }],
  }), { status: 200 });
  await assert.rejects(getCaseStudies(), /public contract/);
});

test("surfaces service failures instead of substituting an empty dataset", async () => {
  globalThis.fetch = async () => new Response("Unavailable", { status: 503 });
  await assert.rejects(getCaseStudies(), (error) => error.status === 503);
});

test("accepts an empty public listing without inserting demo records", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ data: [] }), { status: 200 });
  assert.deepEqual(await getCaseStudies(), []);
});

test("requires the backend featured flag rather than inventing a designation", async () => {
  const record = summary(1);
  delete record.featured;
  globalThis.fetch = async () => new Response(JSON.stringify({ data: [record] }), { status: 200 });
  await assert.rejects(getCaseStudies(), /public contract/);
});

test("recognizes the editor's canonical YouTube reference before cover fallback", () => {
  const study = { ...summary(1), content: { type: "doc", content: [
    { type: "video", attrs: { provider: "youtube", video_id: "LhnCsygAvzY" } },
  ] } };
  assert.deepEqual(getPrimaryMedia(study), {
    type: "video", provider: "youtube", videoId: "LhnCsygAvzY",
    src: "https://www.youtube-nocookie.com/embed/LhnCsygAvzY",
  });
});

test("invalid video references retain the cover fallback", () => {
  const study = { ...summary(1), content: { type: "doc", content: [
    { type: "video", attrs: { provider: "youtube", video_id: "../invalid" } },
  ] } };
  assert.equal(getPrimaryMedia(study).type, "image");
  assert.equal(getPrimaryMedia(study).src, study.cover_image_url);
});


test("hero uses only structured video nodes, otherwise the cover", () => {
  const study = { ...summary(1), content: { arbitrary: { src: "https://cdn.test/file.mp4" }, type: "doc", content: [{ type: "image", attrs: { src: "https://cdn.test/body.jpg" } }] } };
  assert.equal(getCaseStudyHeroMedia(study).src, study.cover_image_url);
});

test("hero extraction omits only its video without mutating authored content", () => {
  const content = { type: "doc", content: [
    { type: "paragraph", content: [{ type: "text", text: "Before" }] },
    { type: "video", attrs: { provider: "youtube", video_id: "LhnCsygAvzY" } },
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "After" }] },
    { type: "video", attrs: { src: "https://cdn.test/another.mp4" } },
  ] };
  const original = JSON.stringify(content);
  const media = getCaseStudyHeroMedia({ ...summary(1), content });
  const body = withoutHeroVideo(content, media);
  assert.deepEqual(body.content, [content.content[0], content.content[2], content.content[3]]);
  assert.equal(JSON.stringify(content), original);
});
