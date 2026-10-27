import targets from "../../../../../packages/types/src/related-services.json";

// The backend rejects "all", so it is not a selectable targeting value.
export type RelatedService = Exclude<keyof typeof targets, "all">;
export const relatedServiceOptions = (Object.entries(targets) as [keyof typeof targets, { label: string }][])
  .filter((entry): entry is [RelatedService, { label: string }] => entry[0] !== "all")
  .map(([value, target]) => ({ value, label: target.label }));

export function serviceLabel(value: string) {
  return relatedServiceOptions.find((option) => option.value === value)?.label ?? value;
}
