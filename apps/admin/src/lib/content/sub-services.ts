import type { RelatedService } from "./related-services";
import { servicePages } from "./service-pages";

/**
 * Blog and Case Study sub-service options, derived from the shared service page configuration.
 * The backend stores these as snake_case keys, so each hyphenated page key is converted.
 */
export const subServiceOptions: ReadonlyArray<{ value: string; label: string; service: RelatedService }> =
  servicePages.flatMap((page) => page.subPages.map((sub) => ({ value: sub.key.replaceAll("-", "_"), label: sub.name, service: page.service })));

/** Known label, or a readable form of an unknown key so existing values are never hidden. */
export function subServiceLabel(value: string) {
  const known = subServiceOptions.find((option) => option.value === value)?.label;
  return known ?? value.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
