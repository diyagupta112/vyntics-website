import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const source = (await readFile(new URL("./case-study-content.tsx", import.meta.url), "utf8"))
  .replace('import styles from "./case-study-content.module.css";', 'const styles = { prose: "prose" };');
const compiled = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText.replaceAll('"react/jsx-runtime"', JSON.stringify(import.meta.resolve("react/jsx-runtime")))
  .replaceAll('"react"', JSON.stringify(import.meta.resolve("react")));
const { CaseStudyContent } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const render = content => renderToStaticMarkup(createElement(CaseStudyContent, { content }));

test("preserves authored heading levels and order without requiring named sections", () => {
  const html = render({ type: "doc", content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "What we learned" }] },
    { type: "paragraph", content: [{ type: "text", text: "Delivery notes", marks: [{ type: "bold" }] }] },
    { type: "heading", attrs: { level: 4 }, content: [{ type: "text", text: "Next steps" }] },
  ] });
  assert.match(html, /<h2>.*What we learned.*<\/h2>/);
  assert.match(html, /<h4>.*Next steps.*<\/h4>/);
  assert.match(html, /<strong>Delivery notes<\/strong>/);
  assert.ok(html.indexOf("What we learned") < html.indexOf("Delivery notes"));
  assert.doesNotMatch(html, /The challenge|The solution|The outcomes|<section/);
});

test("does not infer section titles or reorder object content", () => {
  const html = render({ outcome: "First authored block", problem: "Second authored block", custom: "Third authored block" });
  assert.ok(html.indexOf("First authored block") < html.indexOf("Second authored block"));
  assert.ok(html.indexOf("Second authored block") < html.indexOf("Third authored block"));
  assert.doesNotMatch(html, /<h[1-6]|<section|The challenge|The outcome/);
});

test("empty content creates no invented sections or metrics", () => {
  assert.equal(render({}), '<div class="prose"></div>');
});

const imageBlock = (url, alt) => ({ type: "image", attrs: { url, alt } });
const paragraph = text => ({ type: "paragraph", content: [{ type: "text", text }] });

test("renders body images in place with the author's alt text", () => {
  const html = render({ type: "doc", content: [
    paragraph("Before"),
    imageBlock("https://cdn.test/storage/v1/object/public/content-images/a/one.png", "Architecture diagram"),
    paragraph("Between"),
    imageBlock("https://cdn.test/storage/v1/object/public/content-images/a/two.png", "Deployment workflow"),
    paragraph("After"),
  ] });
  assert.match(html, /<img src="https:\/\/cdn\.test\/[^"]*one\.png" alt="Architecture diagram"/);
  assert.match(html, /<img src="https:\/\/cdn\.test\/[^"]*two\.png" alt="Deployment workflow"/);
  const order = ["Before", "one.png", "Between", "two.png", "After"].map(part => html.indexOf(part));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
  assert.ok(order.every(index => index >= 0));
});

test("malformed body images render nothing and do not break surrounding content", () => {
  const html = render({ type: "doc", content: [
    paragraph("Kept"),
    { type: "image" },
    { type: "image", attrs: { alt: "no url" } },
    imageBlock("javascript:alert(1)", "unsafe"),
    paragraph("Also kept"),
  ] });
  assert.doesNotMatch(html, /<img|javascript:|unsafe|no url/);
  assert.match(html, /Kept/);
  assert.match(html, /Also kept/);
});
