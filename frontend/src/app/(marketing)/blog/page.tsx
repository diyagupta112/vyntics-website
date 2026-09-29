import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import styles from "@/components/pages/listing-page.module.css";
import { articles } from "@/content/articles";

export const metadata: Metadata = { title: "Blog", description: "Practical guides and perspectives from Vyntics on AI, data engineering, analytics, and cloud systems." };

function ArrowIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>; }

export default function BlogPage() {
  return (
    <>
      <section className={styles.hero}>
        <Container><p className={styles.eyebrow}>Ideas from the field</p><h1>Practical thinking for data and AI teams.</h1><p>Guides, comparisons, and perspectives for building reliable systems beyond the demo.</p></Container>
      </section>
      <section className={styles.section}>
        <Container>
          <div className={styles.sectionHeading}><p className={styles.label}>Latest articles</p><h2>What we have learned building this stuff.</h2></div>
          <div className={styles.cardGrid}>
            {articles.map((article) => (
              <article className={styles.card} key={article.href}>
                <p className={styles.cardMeta}>{article.category} · {article.readTime}</p>
                <h2>{article.title}</h2><p>{article.description}</p>
                <div className={styles.cardFooter}><span className={styles.cardMeta}>{article.date}</span><a href={article.href} target="_blank" rel="noreferrer">Read article <ArrowIcon /></a></div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
