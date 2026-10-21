"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";
import styles from "./data-engineering-services-showcase.module.css";

export type ServiceShowcaseItem = {
  name: string; href: string; image: string; imageAlt: string;
  introduction: string; points?: readonly string[];
};

const dataServices = [
  {
    name: "Data Pipelines & Integration",
    href: "/services/data-engineering/data-pipelines-integration",
    image: "/images/services/our-services-section/data-pipelines-integration.jpg",
    imageAlt: "Data professional working at a computer on data pipelines in an office.",
    introduction: "Move data reliably from operational systems into the places where teams can use it, without depending on manual exports or fragile scripts.",
  },
  {
    name: "Data Warehousing & Lakehouse",
    href: "/services/data-engineering/data-warehousing-lakehouse",
    image: "/images/services/our-services-section/data-warehousing-lakehouse.jpg",
    imageAlt: "Operator monitoring several data systems on large control-room displays.",
    introduction: "Create one governed, query-ready foundation for reporting, analytics, and AI while keeping performance, access, and cost visible.",
  },
  {
    name: "Data Quality & Governance",
    href: "/services/data-engineering/data-quality-governance",
    image: "/images/services/our-services-section/data-quality-governance.jpg",
    imageAlt: "Colleagues reviewing printed data quality reports and charts together.",
    introduction: "Make critical data trustworthy by defining what it means, who owns it, who can access it, and what happens when it fails.",
  },
] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export function DataEngineeringServicesShowcase({
  services = dataServices,
  eyebrow = "Our data engineering services",
  heading = "Three connected capabilities, one dependable data system.",
  headingId = "services-title",
  idPrefix = "data-service",
  label = "Data engineering services",
}: {
  services?: readonly ServiceShowcaseItem[];
  eyebrow?: string;
  heading?: string;
  headingId?: string;
  idPrefix?: string;
  label?: string;
  imageLabel?: string;
} = {}) {
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
    document.getElementById(`${idPrefix}-tab-${nextIndex}`)?.focus();
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
          <p>{eyebrow}</p>
          <h2 id={headingId}>{heading}</h2>
        </div>
        <div className={styles.serviceRail} role="tablist" aria-label={label} aria-orientation="vertical">
          <div className={styles.railHeading}>
            <span>Services</span>
            {!reduceMotion && <button type="button" onClick={() => setManualPaused((paused) => !paused)} aria-pressed={manualPaused}>{manualPaused ? "Resume" : "Pause"} rotation</button>}
          </div>
          {services.map((service, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                className={`${styles.serviceTab} ${isActive ? styles.activeTab : ""}`}
                id={`${idPrefix}-tab-${index}`}
                key={service.name}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${idPrefix}-panel`}
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
        id={`${idPrefix}-panel`}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-tab-${activeIndex}`}
        key={activeService.name}
      >
        <div className={styles.imageFrame}>
          <Image src={activeService.image} alt={activeService.imageAlt} fill sizes="(max-width: 760px) 100vw, 65vw" />
          <span>{eyebrow}</span>
          <div className={styles.panelContent}>
            <p className={styles.panelEyebrow}>Service {String(activeIndex + 1).padStart(2, "0")}</p>
            <h3>{activeService.name}</h3>
            <p className={styles.introduction}>{activeService.introduction}</p>
            {!!activeService.points?.length && <>
              <p className={styles.listHeading}>Here&apos;s how we do it:</p>
              <ul>{activeService.points.map((point) => <li key={point}>{point}</li>)}</ul>
            </>}
            <Link href={activeService.href}>Explore {activeService.name} <ArrowIcon /></Link>
          </div>
        </div>
      </article>
    </div>
  );
}
