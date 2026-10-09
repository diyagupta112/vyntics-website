"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, FocusEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { Blog } from "@/lib/blogs";
import styles from "./blog-showcase.module.css";

const AUTOPLAY_INTERVAL_MS = 3500;

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d={direction === "left" ? "M16 10H5m4-4-4 4 4 4" : "M4 10h11m-4-4 4 4-4 4"} />
    </svg>
  );
}

export function BlogShowcase({ blogs, unavailable = false, loading = false }: { blogs: Blog[]; unavailable?: boolean; loading?: boolean }) {
  const articles = blogs.map((blog, index) => ({
    category: blog.category, title: blog.title, railTitle: blog.title, description: blog.excerpt,
    date: new Date(blog.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }),
    dateTime: blog.published_at, readTime: `${blog.read_time} min read`,
    href: `/blog/${encodeURIComponent(blog.slug)}`,
    accent: "#2563eb", soft: "#DDDBFF", motif: String(index + 1).padStart(2, "0"), cover: blog.cover_image_url,
  }));
  const reduceMotion = useReducedMotion();
  const [articleOrder, setArticleOrder] = useState(() => blogs.map((_, index) => index));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const queuedIndex = articleOrder[0] ?? 0;
  const activeIndex = hoveredIndex ?? queuedIndex;
  const isPaused = isHovered || hasFocus;

  const showArticle = (index: number) => {
    setArticleOrder((currentOrder) => {
      const position = currentOrder.indexOf(index);
      if (position <= 0) return currentOrder;
      return [...currentOrder.slice(position), ...currentOrder.slice(0, position)];
    });
  };

  const showNextArticle = () => {
    setArticleOrder((currentOrder) => [...currentOrder.slice(1), currentOrder[0] ?? 0]);
  };

  const showPreviousArticle = () => {
    setArticleOrder((currentOrder) => [currentOrder.at(-1) ?? 0, ...currentOrder.slice(0, -1)]);
  };

  useEffect(() => {
    if (reduceMotion || isPaused || blogs.length < 2) return;

    const autoplay = window.setInterval(() => {
      setArticleOrder((currentOrder) => [...currentOrder.slice(1), currentOrder[0] ?? 0]);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(autoplay);
  }, [isPaused, reduceMotion, blogs.length]);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
  };

  return (
    <section id="blogs" className={styles.section} aria-labelledby="blogs-title">
      <Container>
        <header className={styles.header}>
          <div className={styles.headingBlock}>
            <p className={styles.eyebrow}>Ideas from the field</p>
            <h2 id="blogs-title">Practical ideas for data &amp; AI</h2>
            <p>Useful guides for building reliable systems beyond the demo.</p>
          </div>

          <Link className={styles.viewAll} href="/blog">
            View all Blogs <ArrowIcon />
          </Link>
        </header>

        {articles.length > 0 ? <>
        <div
          className={styles.expandingCards}
          aria-label="Latest Vyntics articles"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setHoveredIndex(null);
          }}
          onFocusCapture={() => setHasFocus(true)}
          onBlurCapture={handleBlur}
        >
          {articleOrder.map((articleIndex) => {
            const article = articles[articleIndex];
            const isActive = articleIndex === activeIndex;

            return (
              <motion.article
                layout={!reduceMotion}
                className={`${styles.card} ${isActive ? styles.activeCard : ""}`}
                key={article.href}
                transition={{ layout: { duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] } }}
                style={
                  {
                    "--article-accent": article.accent,
                    "--article-soft": article.soft,
                  } as CSSProperties
                }
                onMouseEnter={() => setHoveredIndex(articleIndex)}
                onFocusCapture={() => showArticle(articleIndex)}
              >
                <button
                  type="button"
                  className={styles.cardTrigger}
                  aria-label={`Show ${article.title}`}
                  aria-pressed={isActive}
                  onClick={() => showArticle(articleIndex)}
                />

                <div className={styles.artwork} aria-hidden="true">
                  {article.cover && <BlogCover src={article.cover} />}
                  <span className={styles.motif}>{article.motif}</span>
                  <span className={styles.orbit} />
                </div>
                <div className={styles.overlay} />
                <span className={styles.railLabel} aria-hidden="true">{article.railTitle}</span>

                <div className={styles.cardContent}>
                  <div className={styles.meta}>
                    <span>{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readTime}</span>
                  </div>

                  <div className={styles.copy}>
                    <h3>{article.title}</h3>
                    <div className={styles.details} aria-hidden={!isActive || undefined}>
                      <p>{article.description}</p>
                      <div className={styles.cardFooter}>
                        <time dateTime={article.dateTime}>{article.date}</time>
                        <Link className={styles.readMore} href={article.href} tabIndex={isActive ? 0 : -1}>
                          Read article <ArrowIcon />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className={styles.controls}>
          <div className={styles.dots} aria-label="Choose an article">
            {articles.map((article, index) => (
              <button
                type="button"
                className={index === queuedIndex ? styles.activeDot : ""}
                aria-label={`Show ${article.title}`}
                aria-current={index === queuedIndex ? "true" : undefined}
                onClick={() => showArticle(index)}
                key={article.href}
              />
            ))}
          </div>

          <div className={styles.arrows} aria-label="Blog carousel controls">
            <button type="button" onClick={showPreviousArticle} aria-label="Previous article">
              <ArrowIcon direction="left" />
            </button>
            <button type="button" onClick={showNextArticle} aria-label="Next article">
              <ArrowIcon />
            </button>
          </div>

        </div>
        </> : <p className={styles.empty} role="status">{loading ? "Loading articles…" : unavailable ? "Articles are temporarily unavailable. Please try again later." : "No articles available yet."}</p>}
      </Container>
    </section>
  );
}

function BlogCover({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  // Decorative cover; the article title provides the accessible name.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={styles.coverImage} src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}
