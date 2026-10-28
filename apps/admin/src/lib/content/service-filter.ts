import { relatedServiceOptions } from "./related-services";
import { subServiceOptions } from "./sub-services";

/** Service and sub-service choices for the Blog and Case Study listing filters. */
export const serviceFilterParents = relatedServiceOptions;
export function subServiceFilterChoices(service: string) {
  return subServiceOptions.filter((option) => option.service === service).map(({ value, label }) => ({ value, label }));
}

/** Listing query string. A sub-service is never sent without its service. */
export function serviceFilterQuery(service: string, subService: string) {
  if (!service) return "";
  const params = new URLSearchParams({ related_service: service });
  if (subService) params.set("related_sub_service", subService);
  return `?${params}`;
}
