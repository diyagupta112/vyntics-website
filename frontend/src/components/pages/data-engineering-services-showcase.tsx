"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";
import styles from "./data-engineering-services-showcase.module.css";

const services = [
  {
    name: "Data Pipelines & Integration",
    href: "/services/data/data-pipelines-integration",
    image: "/images/technology-data.png",
    imageAlt: "Placeholder artwork representing connected data systems and automated pipelines.",
    introduction: "Move data reliably from operational systems into the places where teams can use it, without depending on manual exports or fragile scripts.",
    points: [
      "Connect APIs, databases, files, SaaS platforms, CRMs, and internal systems.",
      "Build scheduled batch pipelines and event-driven streaming where lower latency is justified.",
      "Add orchestration, retries, replay, reconciliation, freshness checks, and accountable alerts.",
    ],
  },
  {
    name: "Data Warehousing & Lakehouse",
    href: "/services/data/data-warehousing-lakehouse",
    image: "/images/technology-cloud.png",
    imageAlt: "Placeholder artwork representing a governed cloud data platform.",
    introduction: "Create one governed, query-ready foundation for reporting, analytics, and AI while keeping performance, access, and cost visible.",
    points: [
      "Design warehouse or lakehouse architecture around actual workloads and growth.",
      "Model shared facts, dimensions, definitions, and reusable analytical datasets.",
      "Establish security boundaries, workload isolation, monitoring, retention, and ownership.",
    ],
  },
  {
    name: "Data Quality & Governance",
    href: "/services/data/data-quality-governance",
    image: "/images/technology-analytics.png",
    imageAlt: "Placeholder artwork representing data monitoring and quality signals.",
    introduction: "Make critical data trustworthy by defining what it means, who owns it, who can access it, and what happens when it fails.",
    points: [
      "Profile data and automate checks for freshness, completeness, validity, and consistency.",
      "Document business definitions, ownership, sensitivity, lineage, and access rules.",
      "Route quality incidents to the right owner with context and a clear resolution path.",
    ],
  },
] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export function DataEngineeringServicesShowcase() {
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
    document.getElementById(`data-service-tab-${nextIndex}`)?.focus();
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
          <p>Our data engineering services</p>
          <h2 id="services-title">Three connected capabilities, one dependable data system.</h2>
        </div>
        <div className={styles.serviceRail} role="tablist" aria-label="Data engineering services" aria-orientation="vertical">
          <div className={styles.railHeading}>
            <span>Services</span>
            {!reduceMotion && <button type="button" onClick={() => setManualPaused((paused) => !paused)} aria-pressed={manualPaused}>{manualPaused ? "Resume" : "Pause"} rotation</button>}
          </div>
          {services.map((service, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                className={`${styles.serviceTab} ${isActive ? styles.activeTab : ""}`}
                id={`data-service-tab-${index}`}
                key={service.name}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="data-service-panel"
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

      <article
        className={styles.servicePanel}
        id="data-service-panel"
        role="tabpanel"
        aria-labelledby={`data-service-tab-${activeIndex}`}
        key={activeService.name}
      >
        <div className={styles.imageFrame}>
          <Image src={activeService.image} alt={activeService.imageAlt} fill sizes="(max-width: 760px) 100vw, 65vw" />
          <span>Temporary image</span>
          <div className={styles.panelContent}>
            <p className={styles.panelEyebrow}>Service {String(activeIndex + 1).padStart(2, "0")}</p>
            <h3>{activeService.name}</h3>
            <p className={styles.introduction}>{activeService.introduction}</p>
            <p className={styles.listHeading}>Here&apos;s how we do it:</p>
            <ul>{activeService.points.map((point) => <li key={point}>{point}</li>)}</ul>
            <Link href={activeService.href}>Explore {activeService.name} <ArrowIcon /></Link>
          </div>
        </div>
      </article>
    </div>
  );
}
