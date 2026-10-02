"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Blog } from "@/lib/blogs";
import styles from "./blog-listing.module.css";

const AUTOPLAY_INTERVAL_MS = 4000;

function Cover({ blog }: { blog: Blog }) {
  const [failed, setFailed] = useState(false);
  return <div className={styles.cover}>{/^(https?:\/\/|\/)/.test(blog.cover_image_url) && !failed ? (
    // Backend cover hosts are dynamic.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={blog.cover_image_url} alt={blog.title} loading="lazy" onError={() => setFailed(true)} />
  ) : <span>VYNTICS · INSIGHTS</span>}</div>;
}
function Meta({ blog }: { blog: Blog }) {
  return <div className={styles.meta}><span>{blog.author}</span><time dateTime={blog.published_at}>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(blog.published_at))}</time><span>{blog.read_time} min read</span><span className={styles.category}>{blog.category}</span></div>;
}
export function BlogListing({ blogs, unavailable }: { blogs: Blog[]; unavailable: boolean }) {
  const [query, setQuery] = useState(""); const [category, setCategory] = useState(""); const [sort, setSort] = useState("latest"); const [limit, setLimit] = useState(6);
  const [activeSlide, setActiveSlide] = useState(0);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const slides = [...blogs].sort((a, b) => Number(b.status === "published") - Number(a.status === "published"));
  const goToSlide = useCallback((index: number) => {
    const viewport = carouselRef.current;
    if (!viewport || !slides.length) return;
    const next = (index + slides.length) % slides.length;
    viewport.scrollTo({ left: next * viewport.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [slides.length]);
  useEffect(() => {
    if (slides.length < 2 || focused || touching) return;
    const timer = window.setInterval(() => {
      if (document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const viewport = carouselRef.current;
      if (viewport) goToSlide(Math.round(viewport.scrollLeft / viewport.clientWidth) + 1);
    }, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [activeSlide, goToSlide, slides.length, focused, touching]);
  const categories = [...new Set(blogs.map((blog) => blog.category))].sort();
  const filtering = Boolean(query.trim() || category);
  const filtered = blogs.filter((blog) => (!category || category === blog.category) && `${blog.title} ${blog.excerpt} ${blog.author} ${blog.category}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => sort === "oldest" ? Date.parse(a.published_at) - Date.parse(b.published_at) : Date.parse(b.published_at) - Date.parse(a.published_at));
  return <div className={`${styles.page} ${styles.fullScreenPage}`}>
    {slides.length > 0 && <section className={styles.carousel} aria-label="Featured blogs" aria-roledescription="carousel" onFocus={() => setFocused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }} onTouchStart={() => setTouching(true)} onTouchEnd={() => setTouching(false)} onTouchCancel={() => setTouching(false)}>
      <div className={styles.carouselViewport} ref={carouselRef} tabIndex={0} aria-label="Blog slides. Swipe or use the dots to browse." onScroll={(event) => { const viewport = event.currentTarget; setActiveSlide(Math.round(viewport.scrollLeft / viewport.clientWidth)); }} onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); goToSlide(activeSlide + (event.key === "ArrowRight" ? 1 : -1)); } }}>
        {slides.map((post, index) => <article key={post.id} aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}: ${post.title}`} className={styles.featured}><Link className={styles.featureImage} href={`/blog/${encodeURIComponent(post.slug)}`} aria-label={`Read ${post.title}`}><Cover blog={post} /></Link><div className={styles.featureCopy}><p className={styles.eyebrow}>{index === 0 ? "LATEST INSIGHT" : "FROM OUR BLOG"}</p><h2><Link href={`/blog/${encodeURIComponent(post.slug)}`}>{post.title}</Link></h2><p className={styles.excerpt}>{post.excerpt}</p><Link className={styles.read} href={`/blog/${encodeURIComponent(post.slug)}`}>Read the story ↗</Link><Meta blog={post} /></div></article>)}
      </div>
      {slides.length > 1 && <div className={styles.carouselControls}><div className={styles.carouselDots}>{slides.map((post, index) => <button type="button" key={post.id} className={styles.carouselDot} aria-label={`Show blog ${index + 1}: ${post.title}`} aria-current={activeSlide === index ? "true" : undefined} onClick={() => goToSlide(index)} />)}</div></div>}
    </section>}
    <section className={styles.library} aria-label="Browse blogs"><div className={styles.heading}><h2>Explore our insights</h2><div>Find a fresh perspective on what matters to you.</div></div>
    <div className={styles.filters}><label className={styles.search}><span>Search blogs</span><input type="search" placeholder="Search topics, titles, or authors…" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(6); }} /></label><label><span>Category</span><select value={category} onChange={(e) => { setCategory(e.target.value); setLimit(6); }}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Sort by</span><select value={sort} onChange={(e) => { setSort(e.target.value); setLimit(6); }}><option value="latest">Newest first</option><option value="oldest">Oldest first</option></select></label></div>
    <p className={styles.count} role="status">{filtered.length} articles {filtering ? "found" : "to explore"}</p>
    <div className={styles.grid}>{filtered.slice(0, limit).map((blog) => <article className={styles.card} key={blog.id}><Link href={`/blog/${encodeURIComponent(blog.slug)}`} aria-label={`Read ${blog.title}`}><Cover blog={blog} /></Link><div className={styles.cardCopy}><h3><Link href={`/blog/${encodeURIComponent(blog.slug)}`}>{blog.title}</Link></h3><p>{blog.excerpt}</p><Meta blog={blog} /></div></article>)}</div>
    {!filtered.length && <div className={styles.empty}><h3>{unavailable ? "Our insights will be back shortly." : filtering ? "No matching articles." : "New perspectives are on the way."}</h3><p>{unavailable ? "We couldn’t load the blogs. Please try again shortly." : filtering ? "Try another search or browse all categories." : "Check back for our latest articles."}</p>{filtering && <button onClick={() => { setQuery(""); setCategory(""); setLimit(6); }}>Clear filters</button>}{unavailable && <button onClick={() => window.location.reload()}>Try again</button>}</div>}
    {limit < filtered.length && <div className={styles.more}><button onClick={() => setLimit((value) => value + 6)}>More blogs ↓</button><p>Showing {limit} of {filtered.length} articles</p></div>}
    </section>
  </div>;
}
