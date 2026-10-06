import { CaseStudyEntrances } from "./case-study-entrances";
import { ConsultationLink } from "./consultation-link";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyRelatedCard } from "@/components/sections/case-studies/case-study-related-card";
import { CaseStudyStoryTimeline } from "@/components/sections/case-studies/case-study-story-timeline";
import { CaseStudyContent } from "@/components/sections/case-studies/case-study-content";
import { CaseStudyMedia } from "@/components/sections/case-studies/case-study-media";
import { Container } from "@/components/ui/container";
import { CaseStudyApiError, getCaseStudies, getCaseStudy, getCaseStudyHeroMedia, withoutHeroVideo } from "@/lib/case-studies";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type Props = PageProps<"/case-studies/[slug]">;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

async function loadStudy(slug: string) {
  try {
    return await getCaseStudy(slug);
  } catch (error) {
    if (error instanceof CaseStudyApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const study = await loadStudy((await params).slug);
    return {
      title: { absolute: study.seo_title },
      description: study.meta_description,
      openGraph: { title: study.seo_title, description: study.meta_description, images: [study.cover_image_url] },
    };
  } catch {
    return { title: "Case Study" };
  }
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const study = await loadStudy((await params).slug);
  const primaryMedia = getCaseStudyHeroMedia(study);
  const bodyContent = withoutHeroVideo(study.content, primaryMedia);
  let related: Awaited<ReturnType<typeof getCaseStudies>> = [];

  try {
    related = (await getCaseStudies()).filter((item) => item.slug !== study.slug).slice(0, 2);
  } catch {
    // The main story remains useful when the related-work request is unavailable.
  }

  return (
    <>
      <CaseStudyEntrances slug={study.slug} />
      <article>
        <header className={styles.hero}>
          <Container>
            <Link className={styles.backLink} href="/case-studies">← All case studies</Link>
            <div className={styles.heroGrid}>
              <CaseStudyMedia media={primaryMedia} fallbackSrc={study.cover_image_url} title={study.title} priority className={styles.primaryMedia} />
              <div className={styles.heroSummary}>
                <h1 data-case-study-reveal="text">{study.title}</h1>
                <p className={styles.description} data-case-study-reveal="text" data-case-study-delay="0.06">{study.excerpt}</p>
                <dl>{study.client_name && <div data-case-study-reveal="text" data-case-study-delay="0.12"><dt>Client</dt><dd>{study.client_name}</dd></div>}{study.tags.length > 0 && <div data-case-study-reveal="text" data-case-study-delay="0.18"><dt>Focus</dt><dd className={styles.focusValue}>{study.tags.join(", ")}</dd></div>}</dl>
              </div>
            </div>
          </Container>
        </header>

        <section className={styles.story} aria-labelledby="story-title">
          <Container className={styles.storyGrid}>
            <CaseStudyStoryTimeline slug={study.slug} title={study.title} technology={study.tech_stack.length > 0 ? (
              <div className={styles.technology} data-case-study-reveal="text">
                <h2>Technology</h2>
                <ul>{study.tech_stack.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            ) : null}>
              <CaseStudyContent content={bodyContent} />
            </CaseStudyStoryTimeline>
          </Container>
        </section>
        <section className={styles.consultation} aria-labelledby="consultation-title">
          <Container className={styles.consultationInner}>
            <div data-case-study-reveal="text">
              <h2 id="consultation-title">Have a similar business requirement?</h2>
              <p>Talk to our team and explore how we can help you solve it.</p>
            </div>
            <ConsultationLink>Consult our team <ArrowIcon /></ConsultationLink>
          </Container>
        </section>
      </article>

      <section className={styles.related} aria-labelledby="related-title">
        <Container>
          <div className={styles.relatedHeading} data-case-study-reveal="text">
            <div><p className={styles.eyebrow}>Continue exploring</p><h2 id="related-title">More work from Vyntics.</h2></div>
            <Link href="/case-studies">View all work <ArrowIcon /></Link>
          </div>
          {related.length > 0 ? (
            <div className={styles.relatedGrid} data-case-study-reveal="cards">
              {related.map((item) => (
                <CaseStudyRelatedCard study={item} key={item.id} />
              ))}
            </div>
          ) : (
            <Link className={styles.returnPanel} href="/case-studies">
              <span>Case studies index</span><strong>Return to the full collection and see new work as it is published.</strong><ArrowIcon />
            </Link>
          )}
        </Container>
      </section>


    </>
  );
}
