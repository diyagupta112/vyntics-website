/* eslint-disable @next/next/no-img-element */
import type { BlogPreviewSnapshot } from "./snapshot";
import { BlogPreviewContent } from "./blog-content";
import { safeUrl } from "./media";
import styles from "./public-preview.module.css";
export function BlogPreview({ snapshot: s }: { snapshot: BlogPreviewSnapshot }) {
  const cover = safeUrl(s.cover, true);
  const date = s.published_at && Number.isFinite(Date.parse(s.published_at)) ? new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(s.published_at)) : null;
  const content = s.content.type ? s.content : Object.fromEntries(Object.entries(s.content).sort(([a], [b]) => {
    const order = (key: string) => key === "introduction" ? -1 : key === "conclusion" ? 1000 : 0;
    return order(a) - order(b);
  }));
  return <article>
    <header className={styles.blogHero}>
      {cover ? <img className={styles.blogCover} src={cover} alt="" /> : <span className={styles.missingCover}>No cover image uploaded</span>}
      <div className={styles.blogShade} />
      <div className={styles.blogHeroInner}><span className={styles.back}>← All blogs</span><div><p className={styles.category}>{s.category}</p><h1 className={styles.blogTitle}>{s.title || "Untitled Blog"}</h1><a className={styles.scroll} href="#article-content">Scroll to read ↓</a></div></div>
    </header>
    <div id="article-content" className={styles.readingLayout}>
      <aside className={styles.articleInfo}><p className={styles.eyebrow}>About this article</p><dl><div><dt>Author</dt><dd>{s.author || "Not entered"}</dd></div><div><dt>Published</dt><dd>{date ? <time dateTime={s.published_at!}>{date}</time> : "Not published"}</dd></div><div><dt>Reading time</dt><dd>{s.readTime === null ? "Not entered" : `${s.readTime} min read`}</dd></div><div><dt>Category</dt><dd>{s.category || "Not entered"}</dd></div></dl></aside>
      <section className={styles.articleBody} aria-label="Article content"><p className={styles.excerpt}>{s.excerpt}</p><BlogPreviewContent value={content} /><footer className={styles.articleFooter}><span>Written by {s.author || "Not entered"}</span><span>Explore more blogs →</span></footer></section>
    </div>
  </article>;
}
