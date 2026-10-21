"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import styles from "./legal-page.module.css";

type TocItem = { id: string; title: string };

function goTo(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

/** Splits a leading "12." from a heading so numbers and labels line up in two columns. */
function splitNumber(title: string) {
  const match = /^(\d+\.)\s+(.*)$/.exec(title);
  return match ? { number: match[1], label: match[2] } : { number: "", label: title };
}

/** Sticky desktop sidebar. Plain anchor links work without JavaScript. */
export function PolicyToc({ items }: { items: readonly TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const headings = items.map(item => document.getElementById(item.id)).filter((node): node is HTMLElement => node !== null);
    if (!headings.length || !("IntersectionObserver" in window)) return;
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (items.some(item => item.id === hash)) setActive(hash);
    const visible = new Set<string>();
    // A heading becomes active once it passes below the fixed header.
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      }
      if (!visible.size) return;
      const [top] = [...visible].sort((a, b) => document.getElementById(a)!.getBoundingClientRect().top - document.getElementById(b)!.getBoundingClientRect().top);
      setActive(top);
    }, { rootMargin: "-104px 0px -60% 0px" });
    headings.forEach(heading => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  return <nav className={styles.sidebar} aria-label="On this page">
    <p className={styles.tocHeading}>On this page</p>
    <ul className={styles.tocList}>
      {items.map(item => <li key={item.id}>
        <a href={`#${item.id}`} aria-current={active === item.id ? "location" : undefined} onClick={event => { goTo(event, item.id); setActive(item.id); }}>
          <span className={styles.tocNum}>{splitNumber(item.title).number}</span>
          <span>{splitNumber(item.title).label}</span>
        </a>
      </li>)}
    </ul>
  </nav>;
}

/** Collapsible block shown on tablet and mobile instead of the sidebar. */
export function PolicyTocMobile({ items }: { items: readonly TocItem[] }) {
  const details = useRef<HTMLDetailsElement>(null);
  return <details ref={details} className={styles.mobileToc}>
    <summary>On this page</summary>
    <nav aria-label="On this page">
      <ul className={styles.mobileTocList}>
        {items.map(item => <li key={item.id}>
          <a href={`#${item.id}`} onClick={event => { goTo(event, item.id); if (details.current) details.current.open = false; }}>{item.title}</a>
        </li>)}
      </ul>
    </nav>
  </details>;
}
