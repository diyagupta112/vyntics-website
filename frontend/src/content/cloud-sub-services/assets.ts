import { existsSync } from "node:fs";
import { join } from "node:path";
import type { CloudSubPage } from "./pages";

export function resolveSubHeroImage(page: CloudSubPage) {
  const available = existsSync(join(process.cwd(), "public", page.hero.expectedImage));
  return { src: available ? page.hero.expectedImage : "/images/diagonal-sweep-gradient.webp", alt: available ? page.hero.imageAlt : "", missing: !available };
}
