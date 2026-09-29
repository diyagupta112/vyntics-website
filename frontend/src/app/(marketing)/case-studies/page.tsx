import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import styles from "@/components/pages/listing-page.module.css";
import { projects } from "@/content/projects";

export const metadata: Metadata = { title: "Case Studies", description: "Explore production AI, data, analytics, automation, and cloud work from Vyntics." };

function ArrowIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>; }

export default function CaseStudiesPage() {
  return (
    <>
      <section className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>Case studies</p>
          <h1>Production systems, explained clearly.</h1>
          <p>See how we approach practical AI, data, analytics, automation, and cloud challenges—from the system delivered to the outcomes it supports.</p>
        </Container>
      </section>
      <section className={styles.section}>
        <Container>
          <div className={styles.sectionHeading}><p className={styles.label}>Featured work</p><h2>Built for use beyond the demo.</h2></div>
          <div className={styles.cardGrid}>
            {projects.map((project) => (
              <article className={styles.card} key={project.slug}>
                <p className={styles.cardMeta}>{project.type} · {project.industry}</p>
                <h2>{project.title}</h2>
                <p>{project.summary}</p>
                <div className={styles.cardFooter}>
                  <ul>{project.proofPoints.map((point) => <li key={point}>{point}</li>)}</ul>
                  <Link href={`/case-studies/${project.slug}`}>Read case study <ArrowIcon /></Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
