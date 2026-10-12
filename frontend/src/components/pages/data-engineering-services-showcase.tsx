"use client";

import Image from "next/image";
import Link from "next/link";
import type { KeyboardEvent } from "react";
import styles from "./data-engineering-services-showcase.module.css";
import { useServiceRotation } from "./use-service-rotation";

const services = [
  {
    name: "Data Pipelines & Integration",
    href: "/services/data-engineering/data-pipelines-integration",
    image: "/images/technology-data.png",
    imageAlt: "Connected systems and automated data flows represented across a digital operations network.",
    introduction: "Move data reliably from operational systems into the places where teams can use it, without depending on manual exports or fragile scripts.",
  },
  {
    name: "Data Warehousing & Lakehouse",
    href: "/services/data-engineering/data-warehousing-lakehouse",
    image: "/images/technology-cloud.png",
    imageAlt: "Cloud data platform representing governed storage and analytical workloads.",
    introduction: "Create one governed, query-ready foundation for reporting, analytics, and AI while keeping performance, access, and cost visible.",
  },
  {
    name: "Data Quality & Governance",
    href: "/services/data-engineering/data-quality-governance",
    image: "/images/technology-analytics.png",
    imageAlt: "Monitoring chart representing data quality signals and changing system health.",
    introduction: "Make critical data trustworthy by defining what it means, who owns it, who can access it, and what happens when it fails.",
  },
] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export function DataEngineeringServicesShowcase() {
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
    document.getElementById(`data-service-tab-${nextIndex}`)?.focus();
  }

  return (
    <div className={`${styles.showcase} ${styles.compactShowcase}`} ref={showcaseRef}>
      <div className={styles.leftColumn}>
        <div className={styles.sectionHeading}>
          <p>Our data engineering services</p>
          <h2 id="services-title">Three connected capabilities, one dependable data system.</h2>
        </div>
        <div className={styles.serviceRail} role="tablist" aria-label="Data engineering services" aria-orientation="vertical">
          <div className={styles.railHeading}>
            <span>Services</span>
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
                  {isActive && isRunning && <span className={styles.progress} key={progressKey} onAnimationEnd={advanceService} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <article
        className={`${styles.servicePanel} ${styles.compactPanel}`}
        id="data-service-panel"
        role="tabpanel"
        aria-labelledby={`data-service-tab-${activeIndex}`}
        key={activeService.name}
      >
        <div className={`${styles.imageFrame} ${styles.compactImageFrame}`}>
          <Image src={activeService.image} alt={activeService.imageAlt} fill sizes="(max-width: 760px) 100vw, 65vw" />
          <div className={`${styles.panelContent} ${styles.compactPanelContent}`}>
            <p className={styles.panelEyebrow}>Service {String(activeIndex + 1).padStart(2, "0")}</p>
            <h3>{activeService.name}</h3>
            <p className={styles.introduction}>{activeService.introduction}</p>
            <Link href={activeService.href}>Explore {activeService.name} <ArrowIcon /></Link>
          </div>
        </div>
      </article>
    </div>
  );
}
