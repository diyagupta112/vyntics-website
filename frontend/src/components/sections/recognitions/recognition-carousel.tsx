"use client";

import { useId, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import type { Badge } from "@/lib/badges";
import { BadgeLogo } from "./badge-logo";
import card from "@/app/(marketing)/recognitions/page.module.css";
import styles from "./recognition-carousel.module.css";

const mobileQuery = "(max-width: 700px)";
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribe(query: string, change: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", change);
  return () => media.removeEventListener("change", change);
}
const subscribeMobile = (change: () => void) => subscribe(mobileQuery, change);
const subscribeMotion = (change: () => void) => subscribe(motionQuery, change);
const getMobile = () => window.matchMedia(mobileQuery).matches;
const getMotion = () => window.matchMedia(motionQuery).matches;
const serverSnapshot = () => false;

/** API order is preserved. Movement only follows a user action. */
export function RecognitionCarousel({ badges }: { badges: readonly Badge[] }) {
  const mobile = useSyncExternalStore(subscribeMobile, getMobile, serverSnapshot);
  const reducedMotion = useSyncExternalStore(subscribeMotion, getMotion, serverSnapshot);
  const visible = mobile ? 1 : 2;
  if (!badges.length) return <p className={card.recognitionStatus} role="status">No recognitions available yet.</p>;
  return <RecognitionTrack key={`${badges.map(badge => badge.id).join("-")}-${visible}-${reducedMotion}`} badges={badges} visible={visible} reducedMotion={reducedMotion} />;
}

function RecognitionTrack({ badges, visible, reducedMotion }: { badges: readonly Badge[]; visible: number; reducedMotion: boolean }) {
  const id = useId();
  const looping = badges.length > visible;
  const padding = looping ? visible : 0;
  const [position, setPosition] = useState(padding);
  const [animate, setAnimate] = useState(false);
  const moving = useRef(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const active = ((position - padding) % badges.length + badges.length) % badges.length;
  const records = looping ? [...badges.slice(-padding), ...badges, ...badges.slice(0, padding)] : badges;

  function move(target: number) {
    if (!looping || moving.current) return;
    if (reducedMotion) {
      setAnimate(false);
      setPosition(((target - padding) % badges.length + badges.length) % badges.length + padding);
    } else {
      moving.current = true;
      setAnimate(true);
      setPosition(target);
    }
  }

  function finish() {
    moving.current = false;
    // Identical boundary copies allow an invisible reset after the transition.
    setAnimate(false);
    setPosition(active + padding);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || !looping) return;
    const target = event.key === "ArrowRight" ? position + 1 : event.key === "ArrowLeft" ? position - 1
      : event.key === "Home" ? padding : event.key === "End" ? badges.length - 1 + padding : null;
    if (target === null) return;
    event.preventDefault();
    if (target !== position) move(target);
  }

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!looping || event.pointerType === "mouse") return;
    touch.current = { x: event.clientX, y: event.clientY };
    swiped.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!touch.current) return;
    const dx = event.clientX - touch.current.x;
    const dy = event.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) {
      swiped.current = true;
      move(position + (dx < 0 ? 1 : -1));
    }
  }

  return <div className={styles.carousel} role="region" aria-roledescription={looping ? "carousel" : undefined} aria-label="Recognitions and certifications" onKeyDown={onKeyDown}>
    <div id={id} className={styles.viewport} tabIndex={looping ? 0 : undefined} aria-label="Recognition cards" onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={() => { touch.current = null; }} onClickCapture={event => { if (swiped.current) { event.preventDefault(); swiped.current = false; } }}>
      <div className={styles.track} data-animate={animate} style={{ "--position": position, "--visible": visible } as CSSProperties} onTransitionEnd={event => { if (event.target === event.currentTarget && event.propertyName === "transform") finish(); }} onDragStart={event => event.preventDefault()}>
        {records.map((badge, index) => {
          const shown = !looping || (index >= position && index < position + visible);
          const recordIndex = ((index - padding) % badges.length + badges.length) % badges.length;
          return <article className={`${card.credential} ${styles.slide}`} key={`${badge.id}-${index}`} role="group" aria-roledescription={looping ? "slide" : undefined} aria-label={`${recordIndex + 1} of ${badges.length}: ${badge.name}`} aria-hidden={!shown || undefined} inert={!shown}>
            <div className={card.credentialIdentity}>
              <div className={card.credentialLogo}><BadgeLogo src={badge.logo_url} name={badge.name} className={card.badge} /></div>
              <h3>{badge.name}</h3>
            </div>
            {badge.description && <p className={card.credentialDescription}>{badge.description}</p>}
            {badge.website_url && <a className={card.listingLink} href={badge.website_url} aria-label={`View ${badge.name} official listing`}>View official listing <Arrow direction="next" /></a>}
          </article>;
        })}
      </div>
    </div>
    {looping && <div className={styles.controls}>
      <button type="button" aria-label="Previous recognition" aria-controls={id} onClick={() => move(position - 1)}><Arrow direction="previous" /></button>
      <div className={styles.pagination} role="group" aria-label="Choose a recognition">
        {badges.map((badge, index) => <button type="button" key={badge.id} aria-label={`Show recognition ${index + 1}: ${badge.name}`} aria-current={active === index ? "true" : undefined} aria-controls={id} onClick={() => { if (index !== active) move(index + padding); }}><span /></button>)}
      </div>
      <button type="button" aria-label="Next recognition" aria-controls={id} onClick={() => move(position + 1)}><Arrow direction="next" /></button>
      <span className={styles.srOnly} aria-live="polite" aria-atomic="true">Recognition {active + 1} of {badges.length}: {badges[active].name}</span>
    </div>}
  </div>;
}

function Arrow({ direction }: { direction: "previous" | "next" }) {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d={direction === "previous" ? "M16 10H4m5-5-5 5 5 5" : "M4 10h12m-5-5 5 5-5 5"} /></svg>;
}
