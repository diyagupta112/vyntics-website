"use client";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { trustedMessage } from "./messages";
import type { PreviewSnapshot } from "./snapshot";
import styles from "./preview-dialog.module.css";

export function PreviewDialog({ snapshot, instanceId, onClose, saved = false }: { saved?: boolean; snapshot: PreviewSnapshot; instanceId: string; onClose: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current = document.getElementById("preview-close") as HTMLButtonElement | null;
    close.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  useEffect(() => {
    let sent = false;
    const timer = window.setTimeout(() => setError(true), 12000);
    function receive(event: MessageEvent) {
      if (!trustedMessage(event, frame.current?.contentWindow ?? null, window.location.origin, instanceId)) return;
      if (event.data.type === "vyntics-preview/ready") {
        sent = true;
        frame.current?.contentWindow?.postMessage({ type: "vyntics-preview/snapshot", instanceId, snapshot }, window.location.origin);
      } else if (event.data.type === "vyntics-preview/rendered" && sent) { window.clearTimeout(timer); setReady(true); setError(false); }
      else if (event.data.type === "vyntics-preview/close" && sent) { onClose(); }
      else if (event.data.type === "vyntics-preview/error" && sent) { window.clearTimeout(timer); setError(true); }
    }
    window.addEventListener("message", receive);
    // Same-origin iframe focus is part of the dialog's keyboard cycle.
    function bindFrame() {
      try { frame.current?.contentDocument?.addEventListener("keydown", frameKey); } catch { /* A redirect to sign-in is handled by the handshake timeout. */ }
    }
    function frameKey(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key === "Tab") {
        const doc = frame.current?.contentDocument;
        const controls = doc?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),iframe,[tabindex="0"]');
        if (!controls?.length || event.shiftKey && doc?.activeElement === controls[0] || !event.shiftKey && doc?.activeElement === controls[controls.length - 1]) { event.preventDefault(); close.current?.focus(); }
      }
    }
    const currentFrame = frame.current;
    currentFrame?.addEventListener("load", bindFrame);
    return () => { window.clearTimeout(timer); window.removeEventListener("message", receive); currentFrame?.removeEventListener("load", bindFrame); try { currentFrame?.contentDocument?.removeEventListener("keydown", frameKey); } catch { /* Document may have navigated. */ } };
  }, [instanceId, snapshot, attempt, onClose]);
  return createPortal(<section aria-modal="true" aria-labelledby="preview-title" role="dialog" className={styles.dialog} onClick={event => event.stopPropagation()} onKeyDown={event => {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); }
    if (event.key === "Tab") {
      const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),iframe');
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls[controls.length - 1]?.focus(); }
      else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) { event.preventDefault(); controls[0]?.focus(); }
    }
  }}>
    <header className={styles.header}><div><h2 id="preview-title">{snapshot.type === "blog" ? "Blog" : "Case Study"} Preview</h2><p>{saved ? "Saved record preview · no changes are made" : "Unsaved preview · nothing has been saved or published"}</p></div><div className={styles.actions}><Button variant="secondary" aria-pressed={!mobile} onClick={() => setMobile(false)}>Desktop</Button><Button variant="secondary" aria-pressed={mobile} onClick={() => setMobile(true)}>Mobile</Button><Button id="preview-close" onClick={onClose} variant="secondary">Close Preview</Button></div></header>
    <div className={styles.viewport}>
      {!ready && !error ? <p role="status">Loading Preview…</p> : null}
      {error ? <div role="alert"><p>Preview could not be loaded. Check your session and try again.</p><Button onClick={() => { setReady(false); setError(false); setAttempt(v => v + 1); }} variant="secondary">Retry Preview</Button></div> : null}
      <iframe key={attempt} ref={frame} title={`${snapshot.type === "blog" ? "Blog" : "Case Study"} page preview`} src={`/preview?instance=${encodeURIComponent(instanceId)}`} className={mobile ? styles.mobile : styles.frame} onError={() => setError(true)} />
    </div>
  </section>, document.body);
}
