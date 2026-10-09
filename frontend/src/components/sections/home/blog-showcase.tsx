"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, FocusEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import styles from "./blog-showcase.module.css";

const AUTOPLAY_INTERVAL_MS = 3500;

const articles = [
  {
    category: "Data Engineering",
    title: "What Is the Modern Data Stack? A Practical Guide for 2026",
    railTitle: "Modern Data Stack",
    description: "Learn which tools make up the modern data stack and how to adopt the right architecture for your business.",
    date: "April 1, 2026",
    dateTime: "2026-04-01",
    readTime: "12 min read",
    href: "https://vyntics.com/blog/what-is-modern-data-stack",
    accent: "#2563eb",
    soft: "#93c5fd",
    motif: "STACK / 01",
  },
  {
    category: "Data Engineering",
    title: "Data Engineering vs Data Science: What's the Difference?",
    railTitle: "Engineering vs Science",
    description: "A clear breakdown of the roles, skills, tools, and when your business needs each discipline.",
    date: "March 25, 2026",
    dateTime: "2026-03-25",
    readTime: "11 min read",
    href: "https://vyntics.com/blog/data-engineering-vs-data-science",
    accent: "#4f46e5",
    soft: "#c4b5fd",
    motif: "ROLES / 02",
  },
  {
    category: "Data Engineering",
    title: "How to Build an ETL Pipeline: A Step-by-Step Guide",
    railTitle: "ETL Pipeline",
    description: "A practical guide to ETL tools, architecture patterns, and the decisions that keep pipelines reliable.",
    date: "March 18, 2026",
    dateTime: "2026-03-18",
    readTime: "13 min read",
    href: "https://vyntics.com/blog/how-to-build-etl-pipeline",
    accent: "#0891b2",
    soft: "#67e8f9",
    motif: "PIPELINE / 03",
  },
  {
    category: "Data Analytics",
    title: "Power BI vs Tableau: Which BI Tool Is Right for Your Business?",
    railTitle: "Power BI vs Tableau",
    description: "Compare cost, features, performance, and the situations where each business intelligence tool fits best.",
    date: "March 10, 2026",
    dateTime: "2026-03-10",
    readTime: "12 min read",
    href: "https://vyntics.com/blog/power-bi-vs-tableau",
    accent: "#d97706",
    soft: "#fcd34d",
    motif: "ANALYTICS / 04",
  },
  {
    category: "AI",
    title: "What Is Agentic AI and How Can It Transform Your Business?",
    railTitle: "Agentic AI",
    description: "See how goal-driven AI moves beyond chatbots and where autonomous workflows create real business value.",
    date: "March 3, 2026",
    dateTime: "2026-03-03",
    readTime: "12 min read",
    href: "https://vyntics.com/blog/agentic-ai-for-business",
    accent: "#7c3aed",
    soft: "#d8b4fe",
    motif: "AGENTIC / 05",
  },
] as const;

const initialOrder = [3, 4, 0, 1, 2];

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d={direction === "left" ? "M16 10H5m4-4-4 4 4 4" : "M4 10h11m-4-4 4 4-4 4"} />
    </svg>
  );
}

export function BlogShowcase() {
  const reduceMotion = useReducedMotion();
  const [articleOrder, setArticleOrder] = useState(initialOrder);
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
    if (reduceMotion || isPaused) return;

    const autoplay = window.setInterval(() => {
      setArticleOrder((currentOrder) => [...currentOrder.slice(1), currentOrder[0] ?? 0]);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(autoplay);
  }, [isPaused, reduceMotion]);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
  };

  return (
    <section id="blogs" className={styles.section} aria-labelledby="blogs-title">
      <Container>
        <header className={styles.header}>
          <div className={styles.headingBlock}>
            <p className={styles.eyebrow}>Thoughts from the industry</p>
            <h2 id="blogs-title">Useful data and AI concepts</h2>
            <p>helpful manuals for developing dependable systems outside of the demonstration.</p>
          </div>

          <Link className={styles.viewAll} href="/blog">
            View all Blogs <ArrowIcon />
          </Link>
        </header>

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
                        <a className={styles.readMore} href={article.href} target="_blank" rel="noreferrer" tabIndex={isActive ? 0 : -1}>
                          Read article <ArrowIcon />
                        </a>
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
      </Container>
    </section>
  );
}
