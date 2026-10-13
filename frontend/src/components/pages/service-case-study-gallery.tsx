import { FeaturedCaseStudyCarousel } from "@/components/sections/case-studies/featured-case-study-carousel";
import { getCaseStudy, getCaseStudyHeroMedia, type CaseStudyListItem, type CaseStudyMedia } from "@/lib/case-studies";

/** Service pages use the same presentation and media behavior as the Case Studies page. */
export async function ServiceCaseStudyGallery({ studies }: { studies: CaseStudyListItem[] }) {
  if (!studies.length) return <p role="status">No case studies available yet.</p>;
  const showcased = await Promise.all(studies.map(async study => {
    let media: CaseStudyMedia;
    try {
      media = getCaseStudyHeroMedia(await getCaseStudy(study.slug));
    } catch {
      // A detail request failure should not hide an otherwise published study.
      media = { type: "image", src: study.cover_image_url, alt: `${study.title} project cover` };
    }
    return { ...study, media };
  }));
  return <FeaturedCaseStudyCarousel studies={showcased} />;
}
