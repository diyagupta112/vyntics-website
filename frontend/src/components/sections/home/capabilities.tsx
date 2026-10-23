"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { Container } from "@/components/ui/container";
import { serviceSitemap } from "@/content/service-sitemap";
import styles from "./capabilities.module.css";

type ServicePillarSlug = (typeof serviceSitemap)[number]["slug"];

const capabilityDetails: ReadonlyArray<{
  pillar: ServicePillarSlug;
  anchor: string;
  image: string;
  imageAlt: string;
  imagePosition: string;
  description: string;
  highlights: ReadonlyArray<{ label: string; service: string }>;
}> = [
  {
    pillar: "ai-solutions",
    anchor: "services-ai",
    image: "/images/technology-ai.png",
    imageAlt: "Humanoid service robot in a workplace",
    imagePosition: "58% center",
    description:
      "AI Solutions help teams turn approved business knowledge and repeatable workflows into useful assistants, agents, and automation. We design systems around your data, permissions, and existing tools so outputs remain grounded and actions stay controlled. The result is practical AI that reduces manual work, helps people find reliable answers faster, and fits the way your organization already operates.",
    highlights: [
      { label: "RAG & Knowledge Assistants", service: "rag-knowledge-assistants" },
      { label: "AI Agents", service: "ai-agents" },
      { label: "Intelligent Automation", service: "intelligent-automation" },
    ],
  },
  {
    pillar: "data-engineering",
    anchor: "services-data",
    image: "/images/technology-Data-Engineering.jpg",
    imageAlt: "Team reviewing data visualizations",
    imagePosition: "52% center",
    description:
      "We design and build reliable data pipelines, integrations, warehouses, and lakehouse foundations that bring scattered information into one governed environment. Our engineers improve data quality, ownership, lineage, and access so teams can trust what they use. This creates a dependable base for reporting, operational decisions, and future AI initiatives without unnecessary platform complexity.",
    highlights: [
      { label: "Data Pipelines & Integration", service: "data-pipelines-integration" },
      { label: "Data Warehousing & Lakehouse", service: "data-warehousing-lakehouse" },
      { label: "Data Quality & Governance", service: "data-quality-governance" },
    ],
  },
  {
    pillar: "cloud-foundations",
    anchor: "services-cloud",
    image: "/images/technology-Cloud%20Operations.png",
    imageAlt: "Engineers monitoring cloud infrastructure",
    imagePosition: "58% center",
    description:
      "Cloud Foundations provides the architecture, migration planning, delivery automation, observability, and cost controls needed to run dependable workloads. We shape the environment around security, scale, and operational ownership rather than a generic reference design. Teams gain a platform that is easier to release, monitor, recover, and optimize as products and data workloads grow.",
    highlights: [
      { label: "Cloud Architecture & Migration", service: "cloud-architecture-migration" },
      { label: "DevOps & Reliability", service: "devops-reliability" },
      { label: "Cloud Cost Optimization", service: "cloud-cost-optimization" },
    ],
  },
  {
    pillar: "crm-revenue-ops",
    anchor: "services-others",
    image: "/images/technology-CRM.jpg",
    imageAlt: "Customer operations team collaborating at a workstation",
    imagePosition: "46% center",
    description:
      "CRM & Revenue Ops connects customer data, sales processes, automation, and reporting around the way your teams actually work. We configure and integrate CRM systems, remove manual handoffs, and make pipeline activity easier to measure. Sales and service teams get cleaner records, clearer ownership, and revenue reporting they can use without fighting the system.",
    highlights: [
      { label: "CRM Implementation", service: "crm-implementation-integration" },
      { label: "System Integration", service: "crm-implementation-integration" },
      { label: "Sales Automation", service: "sales-automation-revenue-analytics" },
      { label: "Revenue Analytics", service: "sales-automation-revenue-analytics" },
    ],
  },
  {
    pillar: "analytics-bi",
    anchor: "services-analytics",
    image: "/images/technology-Analytics%26BI.jpg",
    imageAlt: "Analyst working with business dashboards",
    imagePosition: "43% center",
    description:
      "Analytics & BI turns governed data into clear metrics, dashboards, and executive reporting that support real decisions. We align definitions across teams, design useful reporting layers, and select tools that match how people work. Leaders gain a consistent view of performance, while analysts spend less time reconciling conflicting numbers and more time explaining what the data means.",
    highlights: [
      { label: "Dashboards", service: "dashboards-executive-reporting" },
      { label: "Executive Reporting", service: "dashboards-executive-reporting" },
      { label: "BI Consulting", service: "bi-consulting" },
    ],
  }

];

const capabilities = capabilityDetails.map((capability) => {
  const pillar = serviceSitemap.find((item) => item.slug === capability.pillar);
  if (!pillar) throw new Error(`Missing service pillar: ${capability.pillar}`);

  const highlights = capability.highlights.map((highlight) => {
    const service = pillar.services.find((item) => item.slug === highlight.service);
    if (!service) throw new Error(`Missing service route: ${pillar.slug}/${highlight.service}`);

    return {
      label: highlight.label,
      href: `/services/${pillar.slug}/${service.slug}`,
    };
  });

  return {
    ...capability,
    highlights,
    href: `/services/${pillar.slug}`,
    title: pillar.name,
  };
});

type CapabilitiesProps = {
  showHeading?: boolean;
  linkCards?: boolean;
  sectionId?: string;
};

export function Capabilities({
  showHeading = true,
  linkCards = false,
  sectionId = "services",
}: CapabilitiesProps = {}) {
  const showcaseRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!linkCards) return;

    const showcase = showcaseRef.current;
    if (!showcase) return;

    let cancelled = false;
    let context: { revert: () => void } | undefined;
    let media: gsap.MatchMedia | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;

        gsap.registerPlugin(ScrollTrigger);
        context = gsap.context(() => {
          const viewport = showcase.querySelector<HTMLElement>("[data-service-viewport]");
          const track = showcase.querySelector<HTMLElement>("[data-service-track]");
          const section = showcase.closest<HTMLElement>("[data-service-section]");
          if (!viewport || !track || !section) return;

          media = gsap.matchMedia();
          media.add(
            {
              desktop: "(min-width: 961px)",
              reduceMotion: "(prefers-reduced-motion: reduce)",
            },
            (mediaContext) => {
              const conditions = mediaContext.conditions ?? {};
              const desktop = conditions.desktop ?? false;
              const reduceMotion = conditions.reduceMotion ?? false;
              if (!desktop || reduceMotion) return;

              const horizontalDistance = () =>
                Math.max(0, track.scrollWidth - viewport.clientWidth);

              const tween = gsap.to(track, {
                x: () => -horizontalDistance(),
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top top",
                  end: () => `+=${Math.max(horizontalDistance(), 1)}`,
                  pin: section,
                  scrub: 0.65,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                },
              });

              return () => tween.scrollTrigger?.kill();
            },
          );

          ScrollTrigger.refresh();
        }, showcase);
      },
    );

    return () => {
      cancelled = true;
      media?.revert();
      context?.revert();
    };
  }, [linkCards]);

  return (
    <section
      id={sectionId}
      className={styles.section}
      data-service-section
      aria-labelledby={showHeading ? "capabilities-title" : undefined}
      aria-label={showHeading ? undefined : "Services"}
    >
      <Container>
        {showHeading && (
          <header className={styles.headingBlock}>
            <p className={styles.eyebrow}>Services</p>
            <h2 id="capabilities-title">From raw data to working AI</h2>
            <p>From custom AI to the data foundations it runs on-end to end.</p>
          </header>
        )}

      </Container>

      {linkCards && (
        <div ref={showcaseRef} className={styles.showcase} aria-label="Service details">
          <div className={styles.showcaseViewport} data-service-viewport>
            <div className={styles.showcaseTrack} data-service-track>
              {capabilities.map((capability) => (
                <article id={capability.anchor} className={styles.showcasePanel} key={capability.pillar}>
                  <div className={styles.showcaseMedia}>
                    <Image
                      className={styles.showcaseImage}
                      src={capability.image}
                      alt={capability.imageAlt}
                      fill
                      // The panel is tall and narrow, so the cover crop displays these landscape photos much wider than the panel itself.
                      sizes="(max-width: 960px) 100vw, 1400px"
                      quality={90}
                      style={{ objectPosition: capability.imagePosition }}
                    />
                    <span className={styles.showcaseImageShade} aria-hidden="true" />
                  </div>
                  <div className={styles.showcaseCopy}>
                    <p className={styles.showcaseLabel}>Service</p>
                    <h3>
                      <Link className={styles.showcaseTitleLink} href={capability.href}>
                        {capability.title}
                      </Link>
                    </h3>
                    <p className={styles.showcaseDescription}>{capability.description}</p>
                    <ul className={styles.highlightList}>
                      {capability.highlights.map((highlight) => (
                        <li key={highlight.label}>
                          <Link className={styles.highlightLink} href={highlight.href}>
                            {highlight.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link className={styles.showcaseLink} href={capability.href}>
                      Explore service <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
