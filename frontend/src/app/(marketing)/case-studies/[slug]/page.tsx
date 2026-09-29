import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import styles from "@/components/pages/listing-page.module.css";
import { getProject, projects } from "@/content/projects";

type Props = PageProps<"/case-studies/[slug]">;

export function generateStaticParams() { return projects.map((project) => ({ slug: project.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: project.title, description: project.summary } : {};
}

function ArrowIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>; }

export default async function CaseStudyDetailPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  return (
    <>
      <section className={styles.detailHero}>
        <Container>
          <p className={styles.eyebrow}>{project.type} · {project.industry}</p>
          <h1>{project.title}</h1>
          <p className={styles.detailSummary}>{project.summary}</p>
          <div className={styles.metric}><strong>{project.metric}</strong><span>{project.metricLabel}</span></div>
        </Container>
      </section>
      <section className={styles.section}>
        <Container className={styles.detailGrid}>
          <div><p className={styles.label}>The system</p><h2>Focused on a clear operational outcome.</h2><p>{project.summary} The work combines the data, application, and infrastructure layers required to operate the system in production.</p></div>
          <div><p className={styles.label}>What it supports</p><ul>{project.proofPoints.map((point) => <li key={point}>{point}</li>)}</ul></div>
        </Container>
      </section>
      <section className={styles.section}>
        <Container><div className={styles.sectionHeading}><p className={styles.label}>Technology stack</p><h2>Tools used to deliver the system.</h2></div><ul className={styles.tags}>{project.stack.map((item) => <li key={item}>{item}</li>)}</ul></Container>
      </section>
      <section className={styles.cta}><Container><div><p className={styles.label}>Build something similar</p><h2>Start with your workflow, data, and constraints.</h2></div><Link href="/#contact">Discuss your project <ArrowIcon /></Link></Container></section>
    </>
  );
}
