// Build-time only: Next embeds this inventory so ISR needs no source files.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { PRIVATE_PATHS, isPrivatePath } from "./site";

export type SitemapPage = { path: string; noindex: boolean };

function inspectFile(file: string) {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let noindex = false;
  let redirect = false;
  function visit(node: ts.Node) {
    if (ts.isPropertyAssignment(node) && node.name.getText(source).replace(/["']/g, "") === "robots") {
      const text = node.initializer.getText(source);
      noindex ||= /\bnoindex\b/.test(text) || /\bindex\s*:\s*false\b/.test(text);
    }
    if (ts.isCallExpression(node) && ["redirect", "permanentRedirect"].includes(node.expression.getText(source))) {
      redirect = true;
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return { noindex, redirect };
}

export function discoverSitemapPages(root: string, redirectSources: string[]): SitemapPage[] {
  const pages: SitemapPage[] = [];
  function walk(directory: string, segments: string[], inheritedNoindex: boolean) {
    const entries = readdirSync(directory, { withFileTypes: true });
    const layout = entries.find((entry) => entry.isFile() && /^layout\.(tsx?|jsx?)$/.test(entry.name));
    const noindex = inheritedNoindex || Boolean(layout && inspectFile(join(directory, layout.name)).noindex);
    const page = entries.find((entry) => entry.isFile() && /^page\.(tsx?|jsx?)$/.test(entry.name));
    const path = `/${segments.join("/")}`;
    if (page && !isPrivatePath(path) && !redirectSources.includes(path)) {
      const metadata = inspectFile(join(directory, page.name));
      if (!metadata.redirect) pages.push({ path, noindex: noindex || metadata.noindex });
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || /^[\_@]/.test(entry.name)) continue;
      const group = /^\(([^)]+)\)$/.exec(entry.name);
      if (group && PRIVATE_PATHS.includes(`/${group[1]}`)) continue;
      // Dynamic templates are recorded only to gate data-source URLs; never
      // emitted as static URLs. Route groups do not contribute URL segments.
      const next = group ? segments : [...segments, entry.name];
      if (!isPrivatePath(`/${next.join("/")}`)) walk(join(directory, entry.name), next, noindex);
    }
  }
  walk(root, [], false);
  return pages.sort((a, b) => a.path.localeCompare(b.path));
}
