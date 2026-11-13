import { Skeleton, SkeletonLines } from "@/components/ui/skeleton";
import styles from "./blog-listing.module.css";
import articleStyles from "@/app/(marketing)/blog/[slug]/page.module.css";

// Same layout classes as the loaded blog listing: hero, heading, filter bar and a grid of cards.
export function BlogListingSkeleton() {
  return (
    <div className={`${styles.page} ${styles.fullScreenPage}`} role="status" aria-busy="true" aria-label="Loading blogs">
      <section className={styles.featured} aria-hidden="true">
        <div className={styles.featureCopy}>
          <Skeleton style={{ width: "min(36rem, 70%)", height: "2.5rem", flex: "0 0 100%", opacity: 0.35 }} />
          <Skeleton style={{ width: "10rem", opacity: 0.35 }} />
        </div>
      </section>
      <section className={styles.library} aria-hidden="true">
        <div className={styles.heading}><h1>Explore Our Insights</h1><div>Find a fresh perspective on what matters to you.</div></div>
        <div className={styles.filters}>{[0, 1, 2, 3].map((index) => <Skeleton key={index} style={{ height: "2.8rem", marginTop: "1.2rem", borderRadius: ".6rem" }} />)}</div>
        <div className={styles.grid}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <article className={styles.card} key={index}>
              <div className={styles.cover} style={{ aspectRatio: "1.65", minHeight: 0 }} />
              <div className={styles.cardCopy}>
                <Skeleton style={{ width: "85%", height: "1.15rem" }} />
                <SkeletonLines widths={["100%", "92%", "60%"]} className={styles.excerpt} />
                <Skeleton style={{ width: "50%", marginTop: "auto" }} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

// Same hero and three-column reading layout as the loaded article.
export function BlogArticleSkeleton() {
  return (
    <article role="status" aria-busy="true" aria-label="Loading article">
      <header className={articleStyles.hero} aria-hidden="true">
        <div className={articleStyles.heroInner}>
          <span />
          <div className={articleStyles.titleBlock}>
            <Skeleton style={{ width: "8rem", marginBottom: "1rem", opacity: 0.35 }} />
            <Skeleton style={{ width: "90%", height: "clamp(2.1rem, 4.4vw, 4.3rem)", opacity: 0.35 }} />
          </div>
        </div>
      </header>
      <div className={articleStyles.readingLayout} aria-hidden="true">
        <span />
        <section className={articleStyles.body}><SkeletonLines widths={["100%", "96%", "88%", "100%", "72%", "100%", "90%", "55%"]} /></section>
        <span />
      </div>
    </article>
  );
}
