import { CaseStudySectionsSkeleton } from "./case-studies-skeleton";
import { CaseStudiesHero, CaseStudiesIntro } from "./case-studies-static";

export default function CaseStudiesLoading() {
  return <><CaseStudiesHero /><CaseStudiesIntro /><CaseStudySectionsSkeleton /></>;
}
