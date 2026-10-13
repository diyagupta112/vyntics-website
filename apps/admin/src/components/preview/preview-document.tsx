"use client";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { trustedMessage, validInstance } from "./messages";
import type { PreviewSnapshot } from "./snapshot";
import { BlogPreview } from "./blog-preview";
import { CaseStudyPreview } from "./case-study-preview";
import styles from "./public-preview.module.css";

class RenderBoundary extends Component<{ children: ReactNode; onError: () => void }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.error ? <p role="alert">Preview could not be rendered. Close Preview and check the content.</p> : this.props.children; }
}
export function PreviewDocument() {
  const params = useSearchParams();
  const id = params.get("instance");
  const renderFailed = useRef(false);
  const [snapshot, setSnapshot] = useState<PreviewSnapshot>();
  useEffect(() => {
    if (!validInstance(id) || window.parent === window) return;
    function receive(event: MessageEvent) {
      if (trustedMessage(event, window.parent, window.location.origin, id!) && event.data.type === "vyntics-preview/snapshot") setSnapshot(event.data.snapshot);
    }
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "vyntics-preview/ready", instanceId: id }, window.location.origin);
    return () => window.removeEventListener("message", receive);
  }, [id]);
  useEffect(() => { if (snapshot && !renderFailed.current) window.parent.postMessage({ type: "vyntics-preview/rendered", instanceId: id }, window.location.origin); }, [snapshot, id]);
  return <main className={styles.document} onKeyDown={event => { if (event.key === "Escape" && window.parent !== window) { event.preventDefault(); window.parent.postMessage({ type: "vyntics-preview/close", instanceId: id }, window.location.origin); } }} onClick={event => {
    const anchor = (event.target as HTMLElement).closest("a");
    if (anchor && !anchor.getAttribute("href")?.startsWith("#")) event.preventDefault();
  }}>
    {!snapshot ? <div className={styles.empty}><h1>No preview available</h1><p>Open Preview from a Blog or Case Study form to view its current unsaved content.</p></div> : <RenderBoundary onError={() => { renderFailed.current = true; window.parent.postMessage({ type: "vyntics-preview/error", instanceId: id }, window.location.origin); }}>
      <aside className={styles.notice}>{snapshot.type === "blog" ? "This preview follows the current public Blog renderer: heading levels are adjusted; text formatting, links, images, and videos are not shown. Slug-specific editorial additions and related articles are omitted." : "Header, footer, related work, and entrance animations are omitted. Additional YouTube videos are shown here; they are not currently rendered by the public story body."} Navigation links are inactive in Preview.</aside>
      {snapshot.type === "blog" ? <BlogPreview snapshot={snapshot} /> : <CaseStudyPreview snapshot={snapshot} instanceId={id!} />}
    </RenderBoundary>}
  </main>;
}
