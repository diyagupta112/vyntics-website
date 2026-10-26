"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { TechnologyLogo } from "@/components/service-sub/technology-logo";
import styles from "./tools-platforms.module.css";

type ToolGroup = { name: string; tools: readonly string[] };
const toolsPerBatch = 8;

export function ToolsPlatforms({ groups }: { groups: readonly ToolGroup[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(toolsPerBatch);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    // The following process section pins to measured scroll positions. Recalculate
    // them after the toolkit grows or shrinks so it cannot cover the new cards.
    void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => { cancelled = true; };
  }, [activeIndex, visibleCount]);

  function selectCategory(index: number) {
    setActiveIndex(index);
    setVisibleCount(toolsPerBatch);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;
    switch (event.key) {
      case "ArrowRight": nextIndex = (index + 1) % groups.length; break;
      case "ArrowLeft": nextIndex = (index - 1 + groups.length) % groups.length; break;
      case "Home": nextIndex = 0; break;
      case "End": nextIndex = groups.length - 1; break;
      default: return;
    }
    event.preventDefault();
    selectCategory(nextIndex);
    tabs.current[nextIndex]?.focus();
  }

  return (
    <div className={styles.showcase}>
      <div className={styles.tabs} role="tablist" aria-label="Tools by service category">
        {groups.map((group, index) => (
          <button
            key={group.name}
            ref={(element) => { tabs.current[index] = element; }}
            type="button"
            role="tab"
            id={`technology-tab-${index}`}
            aria-controls={`technology-panel-${index}`}
            aria-selected={index === activeIndex}
            tabIndex={index === activeIndex ? 0 : -1}
            className={styles.tab}
            onClick={() => selectCategory(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {group.name}
          </button>
        ))}
      </div>
      {groups.map((group, index) => (
        <div
          key={group.name}
          role="tabpanel"
          id={`technology-panel-${index}`}
          aria-labelledby={`technology-tab-${index}`}
          hidden={index !== activeIndex}
          tabIndex={0}
          className={styles.panel}
        >
          {index === activeIndex && (
            <>
              <ul id={`technology-grid-${index}`} className={styles.grid} key={group.name}>
                {group.tools.slice(0, visibleCount).map((tool) => (
                  <li key={tool} className={styles.card}>
                    <TechnologyLogo name={tool} hideFallback allowParentBrandLogo={false} />
                    <span className={styles.name}>{tool}</span>
                  </li>
                ))}
              </ul>
              <span className={styles.status} role="status">
                Showing {Math.min(visibleCount, group.tools.length)} of {group.tools.length} tools for {group.name}.
              </span>
              {visibleCount < group.tools.length && (
                <button
                  type="button"
                  className={styles.loadMore}
                  aria-controls={`technology-grid-${index}`}
                  onClick={(event) => {
                    if (visibleCount + toolsPerBatch >= group.tools.length) {
                      event.currentTarget.closest<HTMLElement>('[role="tabpanel"]')?.focus({ preventScroll: true });
                    }
                    setVisibleCount(count => Math.min(count + toolsPerBatch, group.tools.length));
                  }}
                >
                  Load More
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
