import type { ServiceIdentifier } from "@/lib/related-services";
import { getCaseStudies } from "@/lib/case-studies";
import { ServiceCaseStudyGallery } from "./service-case-study-gallery";

export async function PublishedServiceCaseStudies({ service }: { service: ServiceIdentifier }) {
  const studies = await getCaseStudies(service).catch(() => null);
  if (studies === null) return <p role="status">Case studies are temporarily unavailable. Please try again later.</p>;
  return <ServiceCaseStudyGallery studies={studies} />;
}
