import assert from "node:assert/strict";
import test from "node:test";

process.env.API_BASE_URL = "https://api.test/";
const { getBadges } = await import("./badges.ts");
const badge = (index) => ({
  id: `badge-${index}`, name: `Recognition ${index}`,
  description: "Full backend description.\n".repeat(index),
  logo_url: index % 2 ? "https://cdn.test/badge.png" : null,
  website_url: index % 2 ? "https://partner.test/listing" : null,
  display_order: index,
});

test("uses the public endpoint and preserves all records, content, URLs and backend order", async () => {
  const data = [badge(4), badge(1), badge(3), badge(2), badge(5)];
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.test/badges");
    assert.equal(options.cache, "no-store");
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ data });
  };
  assert.deepEqual(await getBadges(), data);
});

test("accepts missing optional fields without inventing content", async () => {
  const data = [{ ...badge(1), description: null, logo_url: null, website_url: null }];
  globalThis.fetch = async () => Response.json({ data });
  assert.deepEqual(await getBadges(), data);
});

test("preserves a genuinely empty collection", async () => {
  globalThis.fetch = async () => Response.json({ data: [] });
  assert.deepEqual(await getBadges(), []);
});

test("surfaces transport and service errors instead of rendering fallback badges", async () => {
  globalThis.fetch = async () => { throw new Error("Unavailable"); };
  await assert.rejects(getBadges());
  globalThis.fetch = async () => new Response("Unavailable", { status: 503 });
  await assert.rejects(getBadges(), /request failed/);
});

test("rejects invalid payloads and unsafe listing links", async () => {
  for (const payload of [{}, { data: [badge(1), { ...badge(2), website_url: "javascript:alert(1)" }] }, { data: [{ ...badge(1), name: null }] }]) {
    globalThis.fetch = async () => Response.json(payload);
    await assert.rejects(getBadges(), /public contract/);
  }
});
