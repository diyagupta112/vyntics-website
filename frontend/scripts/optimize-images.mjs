// Compresses oversized images in public/ in place, keeping file names and formats so no code references change.
//
//   node scripts/optimize-images.mjs           optimize and overwrite
//   node scripts/optimize-images.mjs --check   change nothing, exit 1 if any file needs optimizing (for CI)
//
// Uses sharp, which Next.js already installs. Safe to run repeatedly: a file is rewritten only when that saves 10% or more.
import { readdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..", "public");
const check = process.argv.includes("--check");

const MAX_EDGE = 2560;          // longest side in pixels; larger files are downscaled
const JPEG_SKIP_BELOW = 350 * 1024; // small JPEGs within the edge limit are left alone
const MIN_SAVING = 0.1;         // rewrite only if the new file is at least 10% smaller
const PNG_WARN_ABOVE = 500 * 1024;  // PNGs this large after optimizing probably should be JPEG or WebP

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

async function encode(path, extension, meta) {
  const pipeline = sharp(path).rotate().resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
  if (extension === ".png") return pipeline.png({ compressionLevel: 9, effort: 10 }).toBuffer();
  if (extension === ".webp") return pipeline.webp({ quality: 82, effort: 5 }).toBuffer();
  return pipeline.jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:2:0" }).toBuffer();
}

const kb = (bytes) => `${Math.round(bytes / 1024)}KB`;
let changed = 0, saved = 0;
const warnings = [];

for await (const path of walk(root)) {
  const extension = extname(path).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(extension)) continue;
  const { size } = await stat(path);
  const meta = await sharp(path).metadata();
  // Animated images would lose their frames when re-encoded.
  if ((meta.pages ?? 1) > 1) continue;
  const tooLarge = Math.max(meta.width ?? 0, meta.height ?? 0) > MAX_EDGE;
  if ((extension === ".jpg" || extension === ".jpeg") && size < JPEG_SKIP_BELOW && !tooLarge) continue;
  if (extension === ".webp" && size < JPEG_SKIP_BELOW && !tooLarge) continue;

  const output = await encode(path, extension, meta);
  const name = relative(root, path);
  if (output.length <= size * (1 - MIN_SAVING)) {
    changed++; saved += size - output.length;
    console.log(`${check ? "needs optimizing" : "optimized"}  ${kb(size)} -> ${kb(output.length)}  ${name}`);
    if (!check) {
      const temporary = `${path}.tmp`;
      await writeFile(temporary, output);
      await rename(temporary, path);
    }
    if (extension === ".png" && output.length > PNG_WARN_ABOVE) warnings.push(`${name} is still ${kb(output.length)}; consider converting it to JPEG or WebP and updating its references.`);
  } else if (extension === ".png" && size > PNG_WARN_ABOVE) {
    warnings.push(`${name} is ${kb(size)}; consider converting it to JPEG or WebP and updating its references.`);
  }
}

for (const warning of warnings) console.warn(`warning: ${warning}`);
console.log(changed === 0 ? "All images are already optimized." : `${changed} file(s) ${check ? "need optimizing" : "optimized"}, ${kb(saved)} ${check ? "would be saved" : "saved"}.`);
if (check && changed > 0) process.exit(1);
