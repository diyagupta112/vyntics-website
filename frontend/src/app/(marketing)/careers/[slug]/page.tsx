import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationDialog, ApplyButton } from "@/components/sections/careers/application-form";
import { hasStructuredContent, StructuredContent } from "@/components/sections/careers/structured-content";
import { Container } from "@/components/ui/container";
import { getCareer, type JsonValue } from "@/lib/careers";
import styles from "./page.module.css";

type Props = PageProps<"/careers/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCareer(slug);
  return result.status === "success"
    ? { title: result.career.title, description: result.career.short_description }
    : { title: "Career" };
}

function ArrowIcon({ back = false }: { back?: boolean }) {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d={back ? "M16 10H5m4-4-4 4 4 4" : "M4 10h11M11 6l4 4-4 4"} /></svg>;
}

function ContentSection({
  title,
  value,
  variant = "list",
}: {
  title: string;
  value: JsonValue;
  variant?: "prose" | "list";
}) {
  if (!hasStructuredContent(value)) return null;
  const id = `career-${title.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <section className={styles.contentSection} aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <StructuredContent value={value} variant={variant} />
    </section>
  );
}

export default async function CareerDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getCareer(slug);

  if (result.status === "not-found") notFound();
  if (result.status === "error") {
    return (
      <section className={styles.errorState}>
        <Container>
          <p className={styles.eyebrow}>Unable to load role</p>
          <h1>We couldn&apos;t retrieve this opening.</h1>
          <p>Please try again, or return to the complete list of opportunities.</p>
          <div className={styles.errorActions}>
            <a className={styles.primaryButton} href={`/careers/${encodeURIComponent(slug)}`}>Try again <ArrowIcon /></a>
            <Link className={styles.textLink} href="/careers#current-openings"><ArrowIcon back /> Current openings</Link>
          </div>
        </Container>
      </section>
    );
  }

  const { career } = result;
  return (
    <>
      <section className={styles.hero} aria-labelledby="career-title">
        <Container>
          <Link className={styles.backLink} href="/careers#current-openings"><ArrowIcon back /> Back to careers</Link>
          <div className={styles.heroGrid}>
            <div className={styles.heroMain}>
              <p className={styles.eyebrow}>{career.department}</p>
              <h1 id="career-title">{career.title}</h1>
              <p className={styles.summary}>{career.short_description}</p>
              <ul className={styles.heroMeta} aria-label="Role details">
                <li><span>Location</span><strong>{career.location}</strong></li>
                <li><span>Employment</span><strong>{career.employment_type}</strong></li>
                <li><span>Experience</span><strong>{career.experience}</strong></li>
              </ul>
            </div>
            <div className={styles.heroAction}>
              <ApplyButton className={styles.primaryButton}>Apply for this role <ArrowIcon /></ApplyButton>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.roleBody} aria-label={`${career.title} details`}>
        <Container className={styles.roleLayout}>
          <div className={styles.contentColumn}>
            <ContentSection title="About the role" value={career.description} variant="prose" />
            <ContentSection title="What you'll do" value={career.responsibilities} />
            <ContentSection title="What we're looking for" value={career.requirements} />
            <ContentSection title="Nice to have" value={career.nice_to_have} />
            <ContentSection title="Benefits" value={career.benefits} />
          </div>
        </Container>
      </section>
      <ApplicationDialog slug={career.slug} title={career.title} />
    </>
  );
}
