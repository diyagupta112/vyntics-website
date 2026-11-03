import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

// StructuredContent renders every Blog body (and Careers). Load it the same way the Case Study test does.
const source = (await readFile(new URL("./structured-content.tsx", import.meta.url), "utf8"))
  .replace('import styles from "./structured-content.module.css";', 'const styles = { content: "content" };')
  .replace('import type { JsonObject, JsonValue } from "@/lib/careers";', "");
const compiled = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText.replaceAll('"react/jsx-runtime"', JSON.stringify(import.meta.resolve("react/jsx-runtime")))
  .replaceAll('"react"', JSON.stringify(import.meta.resolve("react")));
const { StructuredContent } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const render = value => renderToStaticMarkup(createElement(StructuredContent, { value }));

const text = value => ({ type: "text", text: value });
const paragraph = value => ({ type: "paragraph", content: [text(value)] });
const image = (url, alt) => ({ type: "image", attrs: { url, alt } });
const URL_ONE = "https://project.supabase.co/storage/v1/object/public/content-images/a/one.png";
const URL_TWO = "https://project.supabase.co/storage/v1/object/public/content-images/a/two.png";

test("blog body images render at their position with url and alt", () => {
  const html = render({ type: "doc", content: [
    { type: "heading", attrs: { level: 2 }, content: [text("Architecture")] },
    paragraph("Explains the architecture."),
    image(URL_ONE, "AWS architecture diagram"),
    paragraph("Explains the diagram."),
    image(URL_TWO, "Deployment workflow"),
    paragraph("Closing."),
  ] });
  assert.match(html, new RegExp(`<img src="${URL_ONE}" alt="AWS architecture diagram"`));
  assert.match(html, new RegExp(`<img src="${URL_TWO}" alt="Deployment workflow"`));
  const order = ["Architecture", "Explains the architecture", "one.png", "Explains the diagram", "two.png", "Closing"].map(part => html.indexOf(part));
  assert.ok(order.every(index => index >= 0));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
  assert.equal(html.match(/<img /g).length, 2);
});

test("body images are not styled as covers and carry no presentation attributes", () => {
  const html = render({ type: "doc", content: [image(URL_ONE, "Diagram")] });
  assert.doesNotMatch(html, /width=|height=|style=|object-fit|cover/);
  assert.match(html, /<figure><img /);
});

test("malformed or unsafe image blocks render nothing and never break the article", () => {
  const html = render({ type: "doc", content: [
    paragraph("Kept"),
    { type: "image" },
    { type: "image", attrs: { alt: "no url" } },
    image("javascript:alert(1)", "unsafe"),
    image("data:image/png;base64,AAAA", "data"),
    image(42, "not a string"),
    paragraph("Also kept"),
  ] });
  assert.doesNotMatch(html, /<img|<figure|javascript:|data:image/);
  assert.match(html, /Kept/);
  assert.match(html, /Also kept/);
});

test("existing blog blocks still render", () => {
  const html = render({ type: "doc", content: [
    { type: "heading", attrs: { level: 2 }, content: [text("Title")] },
    { type: "paragraph", content: [text("Link"), { type: "text", text: " more", marks: [{ type: "bold" }] }] },
    { type: "bulletList", content: [{ type: "listItem", content: [paragraph("Bullet")] }] },
    { type: "orderedList", content: [{ type: "listItem", content: [paragraph("Numbered")] }] },
  ] });
  assert.match(html, /<h3>Title<\/h3>/);
  assert.match(html, /<ul>.*Bullet.*<\/ul>/);
  assert.match(html, /<ol>.*Numbered.*<\/ol>/);
  assert.match(html, /Link/);
});
