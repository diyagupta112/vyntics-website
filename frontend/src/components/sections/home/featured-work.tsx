"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties, type FocusEvent } from "react";
import { Container } from "@/components/ui/container";
import { ThreeDCard } from "@/components/ui/three-d-card";
import styles from "./featured-work.module.css";

const projects = [
  {
    slug: "compliance-rag-chatbot",
    type: "Case study · AI / RAG",
    industry: "Compliance-EdTech · Confidential",
    title: "Compliance RAG Chatbot",
    summary: "A production retrieval-augmented chatbot answering regulatory and compliance questions with a verified citation on every response.",
    metric: "95%+",
    metricLabel: "correct answers",
    proofPoints: ["20K+ documents", "100% answers cited", "Daily freshness"],
    stack: ["AWS Fargate", "Amazon S3", "Pinecone", "PostgreSQL", "FastAPI", "OpenAI"],
    visual: { kind: "image" as const, src: "/images/compliance-rag-chatbot.webp", alt: "The compliance chatbot returning a structured and cited answer" },
  },
  {
    slug: "property-data-platform",
    type: "Featured work · Data platform",
    industry: "Real estate · Portfolio operations",
    title: "Property Data Platform",
    summary: "A governed data foundation unifying leasing, occupancy, and financial data into one dependable view for portfolio teams.",
    metric: "1 view",
    metricLabel: "of portfolio performance",
    proofPoints: ["Automated ingestion", "Governed metrics", "Role-based access"],
    stack: ["Snowflake", "dbt", "Power BI", "Python", "AWS"],
    visual: { kind: "generated" as const, code: "01", label: "Portfolio intelligence", accent: "#2563eb" },
  },
  {
    slug: "document-processing-automation",
    type: "Featured work · AI automation",
    industry: "Operations · Document workflows",
    title: "Intelligent Document Processing",
    summary: "An AI-assisted workflow that classifies incoming documents, extracts critical fields, and routes exceptions to the right team.",
    metric: "24/7",
    metricLabel: "automated document intake",
    proofPoints: ["Structured extraction", "Human review queue", "Audit-ready logs"],
    stack: ["Azure AI", "Python", "FastAPI", "PostgreSQL", "Docker"],
    visual: { kind: "generated" as const, code: "02", label: "Document automation", accent: "#6d5dfc" },
  },
  {
    slug: "executive-analytics-hub",
    type: "Featured work · Analytics / BI",
    industry: "Leadership · Decision intelligence",
    title: "Executive Analytics Hub",
    summary: "A focused analytics layer replacing fragmented reporting with trusted KPIs, drill-down views, and scheduled executive reporting.",
    metric: "Live",
    metricLabel: "decision-ready metrics",
    proofPoints: ["Shared KPI layer", "Automated refresh", "Executive views"],
    stack: ["Power BI", "Tableau", "QuickSight", "SQL", "dbt"],
    visual: { kind: "generated" as const, code: "03", label: "Decision intelligence", accent: "#1453db" },
  },
  {
    slug: "cloud-reliability-platform",
    type: "Featured work · Cloud",
    industry: "Technology · Platform engineering",
    title: "Cloud Reliability Platform",
    summary: "A right-sized cloud foundation with observable services, repeatable deployments, and practical controls for reliability and spend.",
    metric: "Lean",
    metricLabel: "resilient infrastructure",
    proofPoints: ["Repeatable releases", "Cost visibility", "Service monitoring"],
    stack: ["AWS", "Azure", "Terraform", "Kubernetes", "Grafana"],
    visual: { kind: "generated" as const, code: "04", label: "Cloud operations", accent: "#4f46e5" },
  },
] as const;

const AUTOPLAY_INTERVAL_MS = 2000;

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d={direction === "left" ? "M12.5 4.5 7 10l5.5 5.5" : "m7.5 4.5 5.5 5.5-5.5 5.5"} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

export function FeaturedWork() {
  const reduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const project = projects[currentIndex];
  const isPaused = isHovered || hasFocus;

  useEffect(() => {
    if (reduceMotion || isPaused) return;

    const autoplay = window.setInterval(() => {
      setDirection(1);
      setCurrentIndex((index) => (index + 1) % projects.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(autoplay);
  }, [currentIndex, isPaused, reduceMotion]);

  const navigate = (step: number) => {
    setDirection(step);
    setCurrentIndex((index) => (index + step + projects.length) % projects.length);
  };

  const goToProject = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
  };

  return (
    <section id="work" className={styles.section} aria-labelledby="featured-work-title">
      <Container>
        <div className={styles.sectionHeader}>
          <div className={styles.headingBlock}>
            <p className={styles.eyebrow}>Featured work · Built for production</p>
            <h2 id="featured-work-title">Give your business an edge with AI</h2>
            <p>We build production AI and data systems that are accurate, useful, and ready to ship. Here&apos;s what that looks like in practice.</p>
          </div>
        </div>

        <div
          className={styles.carouselViewport}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={() => setHasFocus(true)}
          onBlurCapture={handleBlur}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.article
              className={`${styles.card} ${styles.cardGrid}`}
              key={project.slug}
              initial={reduceMotion ? false : { opacity: 0, x: direction * 72 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * -72 }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 29 }}
            >
              <ThreeDCard
                wrapperClassName={styles.visualFrame}
                className={`${styles.visual} ${project.visual.kind === "generated" ? styles.generatedVisual : ""}`}
              >
                {project.visual.kind === "image" ? (
                  <Image src={project.visual.src} alt={project.visual.alt} fill sizes="(max-width: 900px) 100vw, 54vw" priority />
                ) : (
                  <div className={styles.visualArtwork} style={{ "--project-accent": project.visual.accent } as CSSProperties} aria-label={`${project.visual.label} project illustration`} role="img">
                    <div className={styles.visualWindowBar}><i /><i /><i /></div>
                    <span className={styles.visualCode}>{project.visual.code}</span>
                    <strong>{project.visual.label}</strong>
                    <div className={styles.visualLines}><i /><i /><i /><i /></div>
                  </div>
                )}
                <span className={styles.projectType}>{project.type}</span>
              </ThreeDCard>

              <div className={styles.content}>
                <div>
                  <div className={styles.leadMetric}><strong>{project.metric}</strong><span>{project.metricLabel}</span></div>
                  <p className={styles.client}>{project.industry}</p>
                  <h3>{project.title}</h3>
                  <p className={styles.summary}>{project.summary}</p>
                </div>

                <ul className={styles.proofPoints} aria-label="Project outcomes">
                  {project.proofPoints.map((point) => <li key={point}>{point}</li>)}
                </ul>

                <div className={styles.cardFooter}>
                  <ul className={styles.stack} aria-label="Technology stack">
                    {project.stack.map((technology) => <li key={technology}>{technology}</li>)}
                  </ul>
                  <Link className={styles.caseStudyLink} href={`/case-studies/${project.slug}`}>Read the full case study <span aria-hidden="true">&rarr;</span></Link>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        <div className={styles.bottomControls}>
          <div className={styles.pagination} aria-label="Choose a featured project">
            {projects.map((item, index) => (
              <button type="button" className={index === currentIndex ? styles.activeDot : ""} onClick={() => goToProject(index)} aria-label={`Show ${item.title}`} aria-current={index === currentIndex ? "true" : undefined} key={item.slug} />
            ))}
          </div>

          <div className={styles.carouselNavigation} aria-label="Featured work carousel controls">
            <button type="button" onClick={() => navigate(-1)} aria-label="Previous featured project"><ArrowIcon direction="left" /></button>
            <button type="button" onClick={() => navigate(1)} aria-label="Next featured project"><ArrowIcon direction="right" /></button>
          </div>
        </div>
      </Container>
    </section>
  );
}
