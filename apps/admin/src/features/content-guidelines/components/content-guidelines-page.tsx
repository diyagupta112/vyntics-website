import Link from "next/link";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

import { guidelines, type GuidelineSection } from "../content-guidelines";
import { HierarchyExample } from "./guideline-parts";
import styles from "./content-guidelines.module.css";

function Points({ section }: Readonly<{ section: GuidelineSection }>) {
  return (
    <div className={styles.block}>
      <h3 id={section.id}>{section.title}</h3>
      {section.intro ? <p>{section.intro}</p> : null}
      <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>
    </div>
  );
}

function GuidelineCard({ id, title, intro, children }: Readonly<{ id: string; title: string; intro?: string; children: ReactNode }>) {
  return (
    <Card aria-labelledby={`${id}-heading`} className={styles.card} role="region">
      <div className={styles.cardHeading}>
        <h2 id={`${id}-heading`}>{title}</h2>
        {intro ? <p>{intro}</p> : null}
      </div>
      {children}
    </Card>
  );
}

export function ContentGuidelinesPage() {
  const { blog, caseStudy } = guidelines.types;
  return (
    <div className={styles.page}>
      <PageHeader
        actions={<Link className={styles.linkButton} href="/settings">Back to Settings</Link>}
        description={guidelines.description}
        title={guidelines.title}
      />
      <p className={styles.lead}>{guidelines.intro}</p>
      <nav aria-label="On this page" className={styles.contents}>
        <ul>
          <li><a href="#general-heading">General structure</a></li>
          <li><a href="#blogs-heading">Blogs</a></li>
          <li><a href="#case-studies-heading">Case Studies</a></li>
          <li><a href="#elements-heading">Content elements</a></li>
          <li><a href="#metadata-heading">SEO and summary fields</a></li>
        </ul>
      </nav>

      <GuidelineCard id="general" intro={guidelines.general.intro} title={guidelines.general.title}>
        <ul className={styles.list}>{guidelines.general.points.map((point) => <li key={point}>{point}</li>)}</ul>
        <Points section={guidelines.headings} />
      </GuidelineCard>

      {[blog, caseStudy].map((type) => (
        <GuidelineCard id={type.id === "blog" ? "blogs" : "case-studies"} intro={type.intro} key={type.id} title={type.title}>
          {type.sections.map((section) => <Points key={section.id} section={section} />)}
          <div className={styles.block}>
            <h3>Heading hierarchy example</h3>
            <p>The wording below is placeholder text. Replace it with your own.</p>
            <HierarchyExample label={`${type.title} heading hierarchy example`} rows={type.example} />
          </div>
        </GuidelineCard>
      ))}

      <GuidelineCard id="elements" intro="What each element is for and when to use it." title="Content Elements">
        {guidelines.elements.map((section) => <Points key={section.id} section={section} />)}
      </GuidelineCard>

      <GuidelineCard id="metadata" intro={guidelines.metadata.intro} title={guidelines.metadata.title}>
        <ul className={styles.list}>{guidelines.metadata.points.map((point) => <li key={point}>{point}</li>)}</ul>
      </GuidelineCard>
    </div>
  );
}
