import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyContent } from "@/components/sections/case-studies/case-study-content";
import { CaseStudyMedia } from "@/components/sections/case-studies/case-study-media";
import { Container } from "@/components/ui/container";
import { CaseStudyApiError, getCaseStudies, getCaseStudy, getPrimaryMedia } from "@/lib/case-studies";
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
  const primaryMedia = getPrimaryMedia(study);
  let related: Awaited<ReturnType<typeof getCaseStudies>> = [];

  try {
    related = (await getCaseStudies()).filter((item) => item.slug !== study.slug).slice(0, 2);
  } catch {
    // The main story remains useful when the related-work request is unavailable.
  }

  return (
    <>
      <article>
        <header className={styles.hero}>
          <Container>
            <Link className={styles.backLink} href="/case-studies">← All case studies</Link>
            <div className={styles.heroGrid}>
              <div>
                <p className={styles.eyebrow}>{study.tags.slice(0, 2).join(" · ") || "Case study"}</p>
                <h1>{study.title}</h1>
              </div>
              <div className={styles.heroSummary}>
                <p>{study.excerpt}</p>
                <dl><div><dt>Client</dt><dd>{study.client_name}</dd></div><div><dt>Focus</dt><dd>{study.tags.join(", ") || "Project delivery"}</dd></div></dl>
              </div>
            </div>
          </Container>
        </header>

        <section className={styles.mediaSection} aria-label="Project media">
          <Container><CaseStudyMedia media={primaryMedia} title={study.title} priority className={styles.primaryMedia} /></Container>
        </section>

        <section className={styles.story} aria-labelledby="story-title">
          <Container className={styles.storyGrid}>
            <aside className={styles.storyAside}>
              <p className={styles.eyebrow}>Project story</p>
              <h2 id="story-title">From the challenge to the result.</h2>
              <p>The following account is drawn directly from the published project record.</p>
            </aside>
            <CaseStudyContent content={study.content} />
          </Container>
        </section>

        {study.tech_stack.length > 0 && (
          <section className={styles.technology} aria-labelledby="technology-title">
            <Container className={styles.technologyGrid}>
              <div><p className={styles.eyebrow}>Technology</p><h2 id="technology-title">The tools behind the system.</h2></div>
              <ul>{study.tech_stack.map((item) => <li key={item}>{item}</li>)}</ul>
            </Container>
          </section>
        )}
      </article>

      <section className={styles.related} aria-labelledby="related-title">
        <Container>
          <div className={styles.relatedHeading}>
            <div><p className={styles.eyebrow}>Continue exploring</p><h2 id="related-title">More work from Vyntics.</h2></div>
            <Link href="/case-studies">View all work <ArrowIcon /></Link>
          </div>
          {related.length > 0 ? (
            <div className={styles.relatedGrid}>
              {related.map((item) => (
                <Link href={`/case-studies/${encodeURIComponent(item.slug)}`} className={styles.relatedCard} key={item.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.cover_image_url} alt={`${item.title} project cover`} loading="lazy" width="1280" height="853" />
                  <div><p>{item.tags.slice(0, 2).join(" · ")}</p><h3>{item.title}</h3><span>Read case study <ArrowIcon /></span></div>
                </Link>
              ))}
            </div>
          ) : (
            <Link className={styles.returnPanel} href="/case-studies">
              <span>Case studies index</span><strong>Return to the full collection and see new work as it is published.</strong><ArrowIcon />
            </Link>
          )}
        </Container>
      </section>

      <section className={styles.nextSteps} aria-labelledby="next-step-title">
        <Container className={styles.nextStepGrid}>
          <div className={styles.serviceStep}>
            <p className={styles.eyebrow}>Understand our approach</p>
            <h2 id="next-step-title">See the services behind the work.</h2>
            <Link href="/#services">Explore our services <ArrowIcon /></Link>
          </div>
          <div className={styles.contactStep}>
            <p className={styles.eyebrow}>Have a similar challenge?</p>
            <h2>Start with the problem. We&apos;ll work through what it needs.</h2>
            <Link href="/#contact">Talk to Vyntics <ArrowIcon /></Link>
          </div>
        </Container>
      </section>
    </>
  );
}
