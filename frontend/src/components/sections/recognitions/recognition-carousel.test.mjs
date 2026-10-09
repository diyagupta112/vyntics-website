import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

async function compile(file, replacements = []) {
  let source = await readFile(new URL(file, import.meta.url), "utf8");
  for (const [from, to] of replacements) source = source.replace(from, to);
  const output = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
    .replaceAll('"react/jsx-runtime"', JSON.stringify(import.meta.resolve("react/jsx-runtime")))
    .replaceAll('"react"', JSON.stringify(import.meta.resolve("react")));
  return `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`;
}
const logo = await compile("./badge-logo.tsx");
const { RecognitionCarousel } = await import(await compile("./recognition-carousel.tsx", [
  ['import { BadgeLogo } from "./badge-logo";', `import { BadgeLogo } from ${JSON.stringify(logo)};`],
  ['import card from "@/app/(marketing)/recognitions/page.module.css";', 'const card = new Proxy({}, { get: (_, key) => key });'],
  ['import styles from "./recognition-carousel.module.css";', 'const styles = new Proxy({}, { get: (_, key) => key });'],
]));
const badge = (id, name) => ({ id, name, description: `Description of ${name}`, logo_url: null, website_url: null, display_order: Number(id) });
const render = badges => renderToStaticMarkup(createElement(RecognitionCarousel, { badges }));
test("empty collection has no carousel controls", () => {
  const html = render([]);
  assert.match(html, /No recognitions available yet/);
  assert.doesNotMatch(html, /<article|<button/);
});
test("one record has authored content and no navigation or invented badge/link", () => {
  const html = render([badge("1", "A credential")]);
  assert.match(html, /Description of A credential/);
  assert.doesNotMatch(html, /<button|<img|View official listing/);
});
test("two desktop records are both visible without navigation", () => {
  const html = render([badge("1", "First credential"), badge("2", "Second credential")]);
  assert.equal((html.match(/<article/g) ?? []).length, 2);
  assert.doesNotMatch(html, /<button|aria-hidden/);
  assert.ok(html.indexOf('<h3>First credential</h3>') < html.indexOf('<h3>Second credential</h3>'));
});
for (const count of [3, 8]) test(`${count} records have looping controls and two initially accessible cards`, () => {
  const records = Array.from({ length: count }, (_, index) => badge(String(index + 1), `Credential ${index + 1}`));
  const html = render(records);
  assert.equal((html.match(/<button/g) ?? []).length, count + 2);
  assert.doesNotMatch(html, /disabled/);
  assert.match(html, /aria-label="Show recognition 1: Credential 1" aria-current="true"/);
  const visible = [...html.matchAll(/<article(.*?)<\/article>/g)].filter(match => !match[1].includes('aria-hidden="true"'));
  assert.equal(visible.length, 2);
  assert.match(visible[0][0], /<h3>Credential 1<\/h3>/);
  assert.match(visible[1][0], /<h3>Credential 2<\/h3>/);
});
test("frontend does not rename or sort backend records", () => {
  const html = render([badge("9", "Z partner"), badge("2", "A partner")]);
  assert.ok(html.indexOf('<h3>Z partner</h3>') < html.indexOf('<h3>A partner</h3>'));
});
test("provided logo and listing URL are rendered unchanged", () => {
  const html = render([{ ...badge("1", "A credential"), logo_url: "https://cdn.test/logo.webp", website_url: "https://partner.test/verified-listing" }]);
  assert.match(html, /src="https:\/\/cdn.test\/logo.webp"/);
  assert.match(html, /href="https:\/\/partner.test\/verified-listing"/);
});
