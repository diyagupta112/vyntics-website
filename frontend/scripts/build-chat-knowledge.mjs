/*
  Builds src/content/chat-knowledge.json: the text of every public page, split into small
  chunks. The chatbot API route searches these chunks and answers only from them.

  Usage (dev server must be running):
    node scripts/build-chat-knowledge.mjs [http://localhost:3000]

  Re-run it whenever page content changes.
*/
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const ORIGIN = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const OUT = new URL("../src/content/chat-knowledge.json", import.meta.url);
const CHUNK_SIZE = 650;
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const EXTRA_PATHS = ["/recognitions"];

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match);
}

function extract(html) {
  const title = decode((html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim());
  const main = html.match(/<main[\s>][\s\S]*?<\/main>/i)?.[0];
  if (!main) return null;
  const text = main
    .replace(/<(script|style|svg|noscript|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|section|article|li|h[1-6]|tr|header|footer|figcaption|blockquote|summary|details|button|a)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  const seen = new Set();
  const lines = [];
  for (const raw of decode(text).split("\n")) {
    const line = raw.replace(/�/g, "'").replace(/\s+/g, " ").trim();
    if (line.length < 3 || seen.has(line)) continue;
    seen.add(line);
    lines.push(line);
  }
  return { title, lines };
}

function chunk(lines) {
  const chunks = [];
  let current = "";
  for (const line of lines) {
    if (current && current.length + line.length > CHUNK_SIZE) {
      chunks.push(current);
      current = "";
    }
    current += (current ? "\n" : "") + line;
  }
  if (current) chunks.push(current);
  return chunks;
}

// Some pages stream their content in after the first HTML. A headless browser sees the final page.
function renderedHtml(url) {
  const result = spawnSync(CHROME, ["--headless=new", "--disable-gpu", "--virtual-time-budget=8000", "--dump-dom", url], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    timeout: 60000,
  });
  return result.stdout ?? "";
}

// The dev server can drop a connection while it compiles a page, so retry a few times.
async function fetchWithRetry(url, options) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (attempt >= 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

const sitemap = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
const paths = new Set(
  [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    const url = new URL(match[1]);
    return url.pathname === "" ? "/" : url.pathname;
  }),
);
EXTRA_PATHS.forEach((path) => paths.add(path));
paths.delete("/contact"); // duplicate of /contact-us

const knowledge = [];
for (const path of [...paths].sort()) {
  const response = await fetchWithRetry(ORIGIN + path, { redirect: "follow" });
  if (!response.ok) {
    console.log("skip", path, response.status);
    continue;
  }
  let page = extract(await response.text());
  if (!page || page.lines.length < 12) {
    const rendered = extract(renderedHtml(ORIGIN + path));
    if (rendered && rendered.lines.length > (page?.lines.length ?? 0)) page = rendered;
  }
  if (!page) {
    console.log("skip (no main)", path);
    continue;
  }
  const pieces = chunk(page.lines);
  for (const text of pieces) knowledge.push({ url: path, title: page.title, text });
  console.log(path, pieces.length, "chunks");
}

writeFileSync(OUT, JSON.stringify(knowledge));
console.log("wrote", knowledge.length, "chunks,", JSON.stringify(knowledge).length, "bytes");
