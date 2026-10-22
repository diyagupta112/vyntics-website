"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCookieConsent } from "./consent-provider";
import styles from "./cookie-consent.module.css";

const FIRST_VISIT_DELAY_MS = 3000;


export function CookieConsent() {
  const { ready, consent, settingsOpen, acceptAll, rejectOptional, closeSettings } = useCookieConsent();
  const [delayElapsed, setDelayElapsed] = useState(false);
  const visible = ready && ((consent === null && delayElapsed) || settingsOpen);
  const firstButton = useRef<HTMLButtonElement>(null);

  // First-visit toast waits a few seconds; reopening from Cookie Settings is immediate.
  useEffect(() => {
    const timer = window.setTimeout(() => setDelayElapsed(true), FIRST_VISIT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    firstButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && closeSettings();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [settingsOpen, closeSettings]);

  if (!visible) return null;

  return (
    <section className={styles.toast} role="region" aria-labelledby="cookie-consent-title">
      <h2 id="cookie-consent-title" className={styles.title}>{settingsOpen ? "Cookie settings" : "We use cookies!"}</h2>
      <p className={styles.text}>
        We use cookies to keep Vyntics working smoothly and understand how our website is used. You can accept all
        cookies or reject optional cookies. For more information, please read our{" "}
        <Link href="/privacy-policy" className={styles.policy}>Privacy Policy</Link>.
      </p>
      <div className={styles.actions}>
        <button ref={firstButton} type="button" className={`${styles.button} ${styles.accept}`} onClick={acceptAll}>Accept All</button>
        <button type="button" className={`${styles.button} ${styles.reject}`} onClick={rejectOptional}>Accept Essential Only</button>
      </div>
    </section>
  );
}
