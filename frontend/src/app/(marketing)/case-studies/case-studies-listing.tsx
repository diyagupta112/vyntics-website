"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { CaseStudyCover } from "@/components/sections/case-studies/case-study-cover";
import type { CaseStudyListItem } from "@/lib/case-studies";
import styles from "./page.module.css";

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

function StudyCard({ study, hidden = false }: { study: CaseStudyListItem; hidden?: boolean }) {
  return (
    <Link hidden={hidden} aria-label={`Read the ${study.title} case study`} className={styles.otherCard} href={`/case-studies/${encodeURIComponent(study.slug)}`}>
      <div className={styles.otherMedia}>
        <CaseStudyCover optimized src={study.cover_image_url} title={study.title} />
      </div>
      <div className={styles.otherCopy}>
        <p>{[study.client_name, ...study.tags.slice(0, 2)].filter(Boolean).join(" · ")}</p>
        <h3>{study.title}</h3>
        <span>{study.excerpt}</span>
        <strong>View Case Study <ArrowIcon /></strong>
      </div>
    </Link>
  );
}

export function CaseStudiesListing({ studies }: { studies: CaseStudyListItem[] }) {
  const searchId = useId();
  const tagId = useId();
  const resultsId = useId();
  const sortId = useId();
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("default");
  const tags = useMemo(() => [...new Set(studies.flatMap(study => study.tags).filter(value => value.trim()))]
    .sort((a, b) => a.localeCompare(b)), [studies]);
  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matching = studies.filter(study =>
      (!tag || study.tags.includes(tag)) &&
      (!query || [study.title, study.excerpt, study.client_name].some(value => value.toLowerCase().includes(query))),
    );
    if (sort === "title-asc") return matching.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "title-desc") return matching.sort((a, b) => b.title.localeCompare(a.title));
    if (sort === "newest" || sort === "oldest") {
      const date = (study: CaseStudyListItem) => {
        const value = Date.parse(study.published_at);
        return Number.isFinite(value) ? value : null;
      };
      return matching.sort((a, b) => {
        const first = date(a), second = date(b);
        if (first === null) return second === null ? 0 : 1;
        if (second === null) return -1;
        return sort === "newest" ? second - first : first - second;
      });
    }
    return matching;
  }, [studies, search, tag, sort]);
  const visibleIds = useMemo(() => new Set(results.map(study => study.id)), [results]);
  const displayedCards = useMemo(() => {
    const positions = new Map(results.map((study, index) => [study.id, index]));
    return [...studies].sort((a, b) => (positions.get(a.id) ?? studies.length) - (positions.get(b.id) ?? studies.length));
  }, [studies, results]);
  const active = search.length > 0 || tag !== "";
  const clear = () => { setSearch(""); setTag(""); setSort("default"); };

  if (!studies.length) return <p className={styles.otherEmpty}>No case studies available yet.</p>;

  return (
    <>
      <div className={styles.listingControls}>
        <div className={styles.searchField}>
          <label htmlFor={searchId}>Search case studies</label>
          <input id={searchId} type="search" placeholder="Search case studies"
            value={search} onChange={event => setSearch(event.target.value)}
            onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); setSearch(""); } }}
            aria-controls={resultsId} />
        </div>
        {tags.length > 0 && <div className={styles.tagField}>
          <label htmlFor={tagId}>Filter by technology</label>
          <select id={tagId} value={tag} onChange={event => setTag(event.target.value)} aria-controls={resultsId}>
            <option value="">All technologies</option>
            {tags.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>}
        <div className={styles.sortField}>
          <label htmlFor={sortId}>Sort by</label>
          <select id={sortId} value={sort} onChange={event => setSort(event.target.value)} aria-controls={resultsId}>
            <option value="default">Default order</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title-asc">Title: A–Z</option>
            <option value="title-desc">Title: Z–A</option>
          </select>
        </div>
      </div>
      <div className={styles.listingStatus}>
        <p role="status" aria-live="polite" aria-atomic="true">{results.length} {results.length === 1 ? "case study" : "case studies"}{active ? ` of ${studies.length}` : ""}</p>
        {(active || sort !== "default") && <button type="button" onClick={clear}>Reset all</button>}
      </div>
      <div id={resultsId}>
        <div className={styles.otherGrid} hidden={results.length === 0}>{displayedCards.map(study => <StudyCard study={study} hidden={!visibleIds.has(study.id)} key={study.id} />)}</div>
        {results.length === 0 && <div className={styles.listingEmpty}><p>No case studies match your search. Try a different keyword or clear the filters.</p></div>}
      </div>
    </>
  );
}
