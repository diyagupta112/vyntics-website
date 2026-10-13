"use client";

import Image from "next/image";
import Link from "next/link";
import type { KeyboardEvent } from "react";
import styles from "./data-engineering-services-showcase.module.css";
import { useServiceRotation } from "./use-service-rotation";

const services = [
  {
    name: "RAG & Knowledge Assistants",
    href: "/services/ai-solutions/rag-knowledge-assistants",
    image: "/images/technology-ai.png",
    imageAlt: "Abstract visualization representing an AI assistant retrieving trusted knowledge.",
    introduction: "Give teams fast answers from approved company knowledge, with the source evidence attached to every important claim.",
  },
  {
    name: "AI Agents",
    href: "/services/ai-solutions/ai-agents",
    image: "/images/about-hero-ai.png",
    imageAlt: "Abstract visualization representing connected AI agents and business systems.",
    introduction: "Build bounded agents that use approved tools, complete multi-step work, and stop for human approval when risk demands it.",
  },
  {
    name: "Intelligent Automation",
    href: "/services/ai-solutions/intelligent-automation",
    image: "/images/technology-data.png",
    imageAlt: "Abstract visualization representing structured document processing.",
    introduction: "Combine document intelligence, workflow orchestration, and language models to remove repetitive work while keeping exceptions visible.",
  },
] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export function AiSolutionsServicesShowcase() {
  const { activeIndex, advanceService, isRunning, progressKey, selectService, showcaseRef } = useServiceRotation(services.length);
  const activeService = services[activeIndex];

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
    <div className={`${styles.showcase} ${styles.compactShowcase}`} ref={showcaseRef}>
      <div className={styles.leftColumn}>
        <div className={styles.sectionHeading}>
          <p>Our AI solutions</p>
          <h2 id="services-title">Three focused capabilities, built as one controlled AI system.</h2>
        </div>
        <div className={styles.serviceRail} role="tablist" aria-label="AI solutions" aria-orientation="vertical">
          <div className={styles.railHeading}>
            <span>Services</span>
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
                  {isActive && isRunning && <span className={styles.progress} key={progressKey} onAnimationEnd={advanceService} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <article className={`${styles.servicePanel} ${styles.compactPanel}`} id="ai-service-panel" role="tabpanel" aria-labelledby={`ai-service-tab-${activeIndex}`} key={activeService.name}>
        <div className={`${styles.imageFrame} ${styles.compactImageFrame}`}>
          <Image src={activeService.image} alt={activeService.imageAlt} fill loading="eager" sizes="(max-width: 760px) 100vw, 65vw" />
          <div className={`${styles.panelContent} ${styles.compactPanelContent}`}>
            <h3>{activeService.name}</h3>
            <p className={styles.introduction}>{activeService.introduction}</p>
            <Link href={activeService.href}>Explore {activeService.name} <ArrowIcon /></Link>
          </div>
        </div>
      </article>
    </div>
  );
}
