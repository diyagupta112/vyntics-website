import targets from "../../../../../packages/types/src/related-services.json";

export type RelatedService = keyof typeof targets;
export const relatedServiceOptions = Object.entries(targets).map(([value, target]) => ({
  value: value as RelatedService,
  label: target.label,
}));
