"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";
import styles from "./data-engineering-services-showcase.module.css";

const services = [
  {
    name: "RAG & Knowledge Assistants",
    href: "/services/ai/rag-knowledge-assistants",
    image: "/images/technology-ai.png",
    imageAlt: "Abstract visualization representing an AI assistant retrieving trusted knowledge.",
    introduction: "Give teams fast answers from approved company knowledge, with the source evidence attached to every important claim.",
    points: [
      "Connect documents, wikis, databases, and internal knowledge with access controls intact.",
      "Combine semantic search, keyword retrieval, metadata filtering, and reranking.",
      "Evaluate answer quality, citation accuracy, freshness, and safe refusal behaviour.",
    ],
  },
  {
    name: "AI Agents",
    href: "/services/ai/ai-agents",
    image: "/images/about-hero-ai.png",
    imageAlt: "Abstract visualization representing connected AI agents and business systems.",
    introduction: "Build bounded agents that use approved tools, complete multi-step work, and stop for human approval when risk demands it.",
    points: [
      "Connect agents to APIs, CRMs, databases, ticketing, and internal systems.",
      "Define permissions, validation, approval gates, retries, and stop conditions.",
      "Trace every decision, tool call, output, failure, and human intervention.",
    ],
  },
  {
    name: "Intelligent Automation",
    href: "/services/ai/intelligent-automation",
    image: "/images/technology-data.png",
    imageAlt: "Abstract visualization representing structured document processing.",
    introduction: "Combine document intelligence, workflow orchestration, and language models to remove repetitive work while keeping exceptions visible.",
    points: [
      "Classify and extract data from documents with validation and confidence thresholds.",
      "Coordinate rules, AI decisions, approvals, notifications, and system updates.",
      "Integrate structured LLM capabilities into existing products, APIs, and business tools.",
    ],
  },
] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export function AiSolutionsServicesShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [manualPaused, setManualPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const activeService = services[activeIndex];
  const isPaused = manualPaused || interactionPaused || reduceMotion;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  function selectService(index: number) {
    setActiveIndex(index);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = services.length - 1;
    else if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % services.length;
    else nextIndex = (index - 1 + services.length) % services.length;
    selectService(nextIndex);
    document.getElementById(`ai-service-tab-${nextIndex}`)?.focus();
  }

  return (
    <div
      className={styles.showcase}
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInteractionPaused(false);
      }}
    >
      <div className={styles.leftColumn}>
        <div className={styles.sectionHeading}>
          <p>Our AI solutions</p>
          <h2 id="services-title">Three focused capabilities, built as one controlled AI system.</h2>
        </div>
        <div className={styles.serviceRail} role="tablist" aria-label="AI solutions" aria-orientation="vertical">
          <div className={styles.railHeading}>
            <span>Services</span>
            {!reduceMotion && <button type="button" onClick={() => setManualPaused((paused) => !paused)} aria-pressed={manualPaused}>{manualPaused ? "Resume" : "Pause"} rotation</button>}
          </div>
          {services.map((service, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                className={`${styles.serviceTab} ${isActive ? styles.activeTab : ""}`}
                id={`ai-service-tab-${index}`}
                key={service.name}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="ai-service-panel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectService(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                <span className={styles.serviceIndex}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.serviceName}>{service.name}</span>
                <span className={styles.track} aria-hidden="true">
                  {isActive && <span className={styles.progress} data-paused={isPaused} key={activeIndex} onAnimationEnd={() => setActiveIndex((current) => (current + 1) % services.length)} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <article className={styles.servicePanel} id="ai-service-panel" role="tabpanel" aria-labelledby={`ai-service-tab-${activeIndex}`} key={activeService.name}>
        <div className={styles.imageFrame}>
          <Image src={activeService.image} alt={activeService.imageAlt} fill sizes="(max-width: 820px) 100vw, 58vw" />
          <div className={styles.panelContent}>
            <p className={styles.panelEyebrow}>AI service {String(activeIndex + 1).padStart(2, "0")}</p>
            <h3>{activeService.name}</h3>
            <p className={styles.introduction}>{activeService.introduction}</p>
            <p className={styles.listHeading}>What it includes:</p>
            <ul>{activeService.points.map((point) => <li key={point}>{point}</li>)}</ul>
            <Link href={activeService.href}>Explore {activeService.name} <ArrowIcon /></Link>
          </div>
        </div>
      </article>
    </div>
  );
}
