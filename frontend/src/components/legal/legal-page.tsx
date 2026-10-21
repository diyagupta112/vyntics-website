import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { slugify, type LegalSection } from "./legal-content";
import { PolicyToc, PolicyTocMobile } from "./legal-toc";
import styles from "./legal-page.module.css";

const email = "contact@vyntics.com";

/** Turns the contact address into a mailto link, leaving the wording unchanged. */
function withEmailLink(text: string): ReactNode {
  const index = text.indexOf(email);
  if (index === -1) return text;
  return <>{text.slice(0, index)}<a href={`mailto:${email}`}>{email}</a>{text.slice(index + email.length)}</>;
}

/** Shared template for the legal pages: hero, "On this page" navigation and article. */
export function LegalPage({ title, image, imageAlt, updated, intro = [], sections }: {
  title: string;
  image: string;
  imageAlt: string;
  updated: string;
  intro?: readonly string[];
  sections: readonly LegalSection[];
}) {
  const titleId = `${slugify(title)}-title`;
  const tocItems = sections.map(section => ({ id: slugify(section.title), title: section.title }));
  return <>
    <section className={styles.hero} aria-labelledby={titleId}>
      <Image className={styles.heroImage} src={image} alt={imageAlt} fill preload sizes="100vw" />
      <div className={styles.heroShade} aria-hidden="true" />
      <h1 id={titleId}>{title}</h1>
      <p className={styles.updated}><span aria-hidden="true">*</span>Last updated: {updated}</p>
    </section>
    <Container>
      <div className={styles.layout}>
        <PolicyToc items={tocItems} />
        <div className={styles.column}>
          <PolicyTocMobile items={tocItems} />
          <article className={styles.article}>
            {intro.map(text => <p key={text}>{text}</p>)}
            {sections.map(section => {
              const id = slugify(section.title);
              return <section key={section.title} aria-labelledby={id}>
                <h2 id={id}>{section.title}</h2>
                {section.blocks.map((block, index) => block.type === "p"
                  ? <p key={index}>{withEmailLink(block.text)}</p>
                  : block.type === "h3"
                    ? <h3 key={index} id={slugify(block.text)}>{block.text}</h3>
                    : <ul key={index}>{block.items.map(item => <li key={item}>{item}</li>)}</ul>)}
              </section>;
            })}
          </article>
        </div>
      </div>
    </Container>
  </>;
}
