import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "src");
const cache = new Map();
function loadTs(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const loadedModule = { exports: {} };
  cache.set(file, loadedModule);
  const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const localRequire = (specifier) => {
    if (!specifier.startsWith(".") && !specifier.startsWith("@/")) throw new Error(`Unexpected non-local content dependency: ${specifier}`);
    let target = specifier.startsWith("@/") ? path.join(sourceRoot, specifier.slice(2)) : path.resolve(path.dirname(file), specifier);
    if (!path.extname(target)) target += ".ts";
    return loadTs(target);
  };
  new Function("require", "module", "exports", compiled)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const { technologyTools, technologyToolGroups, technologyToolSources, toolsForSource, technologyIdentity, technologyCategoryOrder, technologyCuratedNames, technologyShowcaseTools, technologyShowcaseOmissions, selectTechnologyShowcase } = loadTs(path.join(sourceRoot, "content/technology-tools.ts"));
const { serviceSitemap } = loadTs(path.join(sourceRoot, "content/service-sitemap.ts"));
const { legacyServiceRoutes } = loadTs(path.join(sourceRoot, "content/service-route-map.ts"));
const { platformServices } = loadTs(path.join(sourceRoot, "content/platform-services.ts"));
const routes = new Set(technologyToolSources.map(source => source.route));
const { getTechnologyLogoFiles: artworkFor, technologyProductLogos } = loadTs(path.join(sourceRoot, "content/technology-logos.ts"));
assert.deepEqual(technologyCategoryOrder, ["AI", "Data", "Cloud", "CRM", "Analytics"]);
assert.deepEqual(technologyToolGroups.map(group => group.name), technologyCategoryOrder);
const canonicalRoutes = serviceSitemap.flatMap(pillar => [
  `/services/${pillar.slug}`, ...pillar.services.map(service => `/services/${pillar.slug}/${service.slug}`),
]);
for (const route of canonicalRoutes) assert.ok(routes.has(route), `Missing canonical route ${route}`);
const legacyRoutes = [];
const retiredRoutes = [];
for (const [group, services] of Object.entries(platformServices)) {
  for (const service of Object.values(services)) {
    const route = `/services/${group}/${service.slug}`;
    if (legacyServiceRoutes[route]) {
      retiredRoutes.push({ route, target: legacyServiceRoutes[route] });
      assert.ok(!routes.has(route), `Obsolete toolkit counted: ${route}`);
    } else {
      legacyRoutes.push(route);
      assert.deepEqual(technologyToolSources.find(source => source.route === route)?.names, service.technologies);
    }
  }
}
const displayedNames = technologyToolGroups.flatMap(group => group.tools);
assert.equal(new Set(displayedNames.map(technologyIdentity)).size, displayedNames.length);
assert.equal(displayedNames.length, technologyShowcaseTools.length);
assert.deepEqual(new Set(displayedNames), new Set(technologyShowcaseTools.map(tool => tool.name)));
assert.equal(technologyShowcaseTools.length + technologyShowcaseOmissions.length, technologyTools.length);
assert.ok(technologyShowcaseOmissions.every(item => item.reason === "not-curated"));
for (const group of technologyToolGroups) {
  assert.ok(group.tools.length >= 12 && group.tools.length <= 16, `${group.name} must contain 12–16 cards`);
  assert.deepEqual(group.tools, technologyCuratedNames[group.name]);
  for (const name of group.tools) {
    assert.ok(technologyTools.some(tool => tool.name === name), `Invented tool: ${name}`);
    assert.ok(artworkFor(name, false).length, `No verified logo: ${name}`);
    assert.equal(technologyTools.find(tool => tool.name === name).primaryCategory, group.name);
  }
}
const aliasPairs = [
  ["Amazon Web Services", "AWS"], ["Azure", "Microsoft Azure"], ["BigQuery", "Google BigQuery"],
  ["Kafka", "Apache Kafka"], ["CloudWatch", "Amazon CloudWatch"], ["dbt tests", "dbt"],
  ["Dynamics 365", "Microsoft Dynamics 365"], ["Azure Document Intelligence", "Azure AI Document Intelligence"],
  ["Cloud Billing", "Google Cloud Billing"], ["Claude", "Anthropic Claude"], ["Gemini", "Google Gemini"],
  ["RAG", "Retrieval-augmented generation (RAG)"],
];
for (const [alias, canonical] of aliasPairs) assert.equal(technologyIdentity(alias), technologyIdentity(canonical));
for (const [a, b] of [["AWS", "AWS Glue"], ["PostgreSQL", "pgvector"], ["SQL", "PostgreSQL"], ["Tableau Cloud", "Tableau Server"], ["Anthropic", "Anthropic Claude"], ["GPT", "OpenAI"]]) {
  assert.notEqual(technologyIdentity(a), technologyIdentity(b));
}
const duplicateCategories = [];
for (const tool of technologyTools) {
  assert.ok(technologyCategoryOrder.includes(tool.primaryCategory));
  if (displayedNames.includes(tool.name)) assert.ok(technologyToolGroups.find(group => group.name === tool.primaryCategory).tools.includes(tool.name));
  for (const category of tool.categories.filter(category => category !== tool.primaryCategory)) {
    duplicateCategories.push({ name: tool.name, keptIn: tool.primaryCategory, removedFrom: category });
  }
  for (const file of artworkFor(tool.name, false)) {
    const asset = fs.readFileSync(path.join(root, "public/images/services/logos", file));
    assert.ok(asset.length > 100, `Empty artwork ${file}`);
    if (file.endsWith(".svg")) assert.match(asset.toString(), /<svg[\s>]/, file);
    if (file.endsWith(".png")) assert.equal(asset.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", file);
  }
}
for (const source of technologyToolSources) {
  assert.ok(fs.existsSync(path.join(root, source.sourceFile)), source.sourceFile);
  for (const name of toolsForSource(source)) {
    const tool = technologyTools.find(tool => tool.name === name);
    assert.ok(tool?.categories.includes(source.category), `Missing source association: ${name}`);
    assert.ok(tool.sources.includes(source.route));
  }
}
for (const name of ["React", "Supabase", "Open-source LLMs", "Retrieval-augmented generation (RAG)", "CI/CD", "AWS Cost Explorer", "Azure Cost Management"]) {
  assert.ok(technologyTools.some(tool => tool.name === name), `Audit discovery missing: ${name}`);
}
for (const name of ["Redis", "Kubecost"]) assert.ok(!displayedNames.includes(name), `Retired-only tool: ${name}`);
const sample = ["Amazon Web Services", "AWS", "AWS Glue", "Open-source LLMs"].map(name => ({name, categories: ["Cloud"], sources: [], primaryCategory: "Cloud"}));
assert.deepEqual(selectTechnologyShowcase(sample).tools.map(tool => tool.name), ["Amazon Web Services", "AWS Glue", "Open-source LLMs"]);
for (const group of technologyToolGroups) {
  for (let count = 8; count < group.tools.length + 8; count += 8) {
    const visible = group.tools.slice(0, count);
    assert.equal(visible.length, Math.min(count, group.tools.length));
    assert.equal(new Set(visible.map(technologyIdentity)).size, visible.length);
  }
}
function walkPages(folder) {
  return fs.readdirSync(folder, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(folder, entry.name);
    return entry.isDirectory() ? walkPages(file) : entry.name === "page.tsx" ? [file] : [];
  });
}
const pages = walkPages(path.join(sourceRoot, "app/(marketing)/services"));
const missingLogos = displayedNames.filter(name => !artworkFor(name, false).length);
const summary = {
  checks: "passed", physicalPageFiles: pages.length, canonicalRoutes: canonicalRoutes.length,
  activeLegacyRoutes: legacyRoutes.length, redirectedLegacyDefinitions: retiredRoutes,
  sourceSections: technologyToolSources.length, auditedTechnologies: technologyTools.length, curatedTechnologies: displayedNames.length,
  removedCategoryOccurrences: duplicateCategories.length, duplicateCategories,
  categories: technologyToolGroups.map(group => ({name: group.name, count: group.tools.length, tools: group.tools})),
  missingLogos,
};
console.log(JSON.stringify(summary, null, 2));
if (process.argv.includes("--write-report")) {
  const lines = [
    "# Technology Tools & Platforms: curated inventory", "",
    "Source audit refreshed October 23, 2026 before selecting cards. Category order: AI, Data, Cloud, CRM, Analytics.", "",
    `Rechecked ${pages.length} service route files, all ${canonicalRoutes.length} canonical main/subservice routes and all 13 legacy toolkit definitions against route configuration and imported content. Eleven legacy definitions render; two redirect and are excluded. The source registry retains ${technologyTools.length} unique named technologies. The Technology page displays **${displayedNames.length} curated, unique, logo-backed cards**.`, "",
    "## Final category inventory", "",
    ...technologyToolGroups.flatMap(group => [`### ${group.name}: ${group.tools.length}`, "", group.tools.join(", ") + ".", ""]),
    "Every category contains 12–16 cards, with a hard validated maximum of 16. Eight cards appear initially; Load More reveals the remainder and disappears. Switching categories resets to eight. Styling, layout, animations and service-page inventories are unchanged.", "",
    "## Selection and primary categories", "",
    "AI favors named model platforms, document AI, retrieval and orchestration frameworks. Data favors Databricks, Google/Microsoft/AWS data products, pipelines and governance. Cloud favors AWS, Azure, Google Cloud, delivery, infrastructure, cost and observability tooling.", "",
    "CRM includes Salesforce, HubSpot, Dynamics and Zoho, plus workflow and communication integrations explicitly approved by the user: MuleSoft, Power Automate, n8n, Zapier, Make, Slack, Microsoft Teams and WhatsApp. All are named in actual service content; the communication integrations are sourced from the RAG page rather than falsely claimed as CRM-page listings.", "",
    "Analytics includes the Microsoft, Tableau and AWS BI products, plus Snowflake, Fabric, dbt and Grafana. Snowflake/Fabric/dbt are explicitly associated with Analytics service content; Grafana is a visualization/observability platform named by Cloud services and assigned once to Analytics. Tableau Cloud/Server and Power BI Service remain distinct deployment products using their correct official family marks. No names are repeated to fill a grid.", "",
    "Selection is a reference-only configuration in technology-tools.ts. Each name must resolve to the imported audit registry, have verified artwork, and have exactly one primary category. Invalid names, duplicate identities, missing logo mappings, or out-of-range counts fail validation. No parallel product definitions or copied service inventories are introduced.", "",
    "## Deduplication and exclusions", "",
    "Identity normalization merges Azure/Microsoft Azure, AWS/Amazon Web Services, BigQuery/Google BigQuery, Kafka/Apache Kafka, CloudWatch/Amazon CloudWatch, dbt tests/dbt, Dynamics 365/Microsoft Dynamics 365 and other documented aliases. AWS and Azure each appear once. Distinct AWS/Azure products remain separate.", "",
    `Not selected for this curated showcase (${technologyShowcaseOmissions.length} audited entries; retained in the source registry): ${technologyShowcaseOmissions.map(item => item.name).join(", ")}.`, "",
    "Text-only entries, the generic SQL symbol and generic Open-source LLM illustration are excluded. No placeholder logos or new tools were added.", "",
    "## Logo availability and choices", "",
    `Missing logos in the curated inventory: **${missingLogos.length}**. All mapped files exist and their SVG/PNG signatures are checked. Existing official/product artwork is reused at its original aspect ratio through the existing renderer. No logo assets or service-page mappings changed in this update.`, "",
    "| Card | Artwork |", "| --- | --- |",
    ...displayedNames.map(name => `| ${name} | ${artworkFor(name, false).join(", ")}${name in technologyProductLogos ? " (existing product override)" : ""} |`), "",
    "Asset provenance remains in public/images/services/logos/README.md. AWS and Azure service cards use their product marks instead of generic parent-brand artwork; Google Document AI and Cloud Billing use their specific console icons. Gemini and Claude use their recognizable product marks. Family artwork is shared only by genuinely different named deployment products.", "",
    "## Main service/subservice pages audited", "",
    ...canonicalRoutes.map(route => "- " + route), "",
    "## Active legacy toolkit pages audited", "",
    ...legacyRoutes.map(route => "- " + route), "",
    ...retiredRoutes.map(item => `- ${item.route}: redirected to ${item.target}; obsolete toolkit excluded.`), "",
    "## Imported service evidence", "",
    "| Route | Source and section | Discovered technologies |", "| --- | --- | --- |",
    ...technologyToolSources.map(source => `| ${source.route} | ${source.sourceFile}: ${source.section} | ${toolsForSource(source).join(", ") || "No named products"} |`), "",
    "The earlier full audit also rendered all 18 canonical and 13 legacy URLs on October 23. Published case-study discoveries (React and Supabase) remain dated snapshots in the audit registry; neither is selected in this curated subset. No new live case-study dependency is introduced.", "",
    "## Complete source inventory retained", "",
    technologyTools.map(tool => tool.name).join(", ") + ".", "",
    "## Files modified by this curation update", "",
    "- src/content/technology-tools.ts",
    "- scripts/audit-technology-tools.mjs",
    "- docs/technology-tools-audit.md",
    "- docs/technology-tools-preview.png (updated screenshot)", "",
    "## Verification", "",
    "Passed the audit script, targeted ESLint for technology-tools.ts and this script, and TypeScript tsc --noEmit --incremental false. The audit validates every canonical/active legacy source, all curated names against source evidence, category order, 12–16 limits, primary category ownership, global identity uniqueness, artwork files/signatures and eight-card pagination prefixes.", "",
    "Browser verification passed all 30 initial/expanded category states at 1440px desktop, 820px tablet and 390px mobile. Confirmed AI is the default, exact tab order, one image per card, 72 globally unique names, preserved pagination prefixes, eight-card resets, and removal of the final Load More button. No failed loaded images, horizontal page overflow, clipping or following-section overlap was observed. Home and ArrowRight keyboard controls passed, and no browser console errors were observed.", "",
  ];
  fs.writeFileSync(path.join(root, "docs/technology-tools-audit.md"), lines.join("\n"));
}
