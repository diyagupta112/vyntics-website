"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import SendButton from "@/components/ui/send-button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import styles from "./contact-cta.module.css";

type SubmitState = "idle" | "submitting" | "success" | "error";

type ContactCtaProps = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  sectionId?: string;
  submitLabel?: string;
  showEyebrowAccent?: boolean;
  primaryAction?: { href: string; label: string };
};

export function ContactCta({
  eyebrow = "Speak with",
  title = "Together, let's review your statistics.",
  intro = "Set up a complimentary 30-minute strategy session. Just have a straight discussion with our specialists about your data and AI concerns without the need for sales teams or presentation decks.",
  sectionId = "contact",
  submitLabel = "Send message",
  showEyebrowAccent = true,
  primaryAction,
}: ContactCtaProps = {}) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (submitState !== "success") return;
    const timer = window.setTimeout(() => {
      setSubmitState("idle");
      setFeedback("");
    }, 7000);
    return () => window.clearTimeout(timer);
  }, [submitState]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState("submitting");
    setFeedback("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim() || undefined,
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      source_page: window.location.pathname || "/",
    };

    try {
      const [response] = await Promise.all([fetch(`${apiBaseUrl}/contact-us`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }), new Promise<void>((resolve) => window.setTimeout(resolve, 700))]);

      if (!response.ok) throw new Error(`Contact request failed with status ${response.status}`);

      form.reset();
      setSubmitState("success");
      setFeedback("Thanks—your message has been sent. We’ll get back to you shortly.");
    } catch {
      setSubmitState("error");
      setFeedback("We couldn’t send your message. Please try again or email contact@vyntics.com.");
    }
  };

  return (
    <section id={sectionId} className={styles.section} aria-labelledby={`${sectionId}-title`}>
      <Container className={styles.layout}>
        <div className={styles.content}>
          <p className={`${styles.eyebrow} ${showEyebrowAccent ? "" : styles.withoutEyebrowAccent}`}>{eyebrow}</p>
          <h2 id={`${sectionId}-title`}>{title}</h2>
          <p className={styles.intro}>{intro}</p>
          {primaryAction && (
            <Link className={styles.emailLink} href={primaryAction.href}>
              {primaryAction.label}
            </Link>
          )}

          <a className={styles.emailLink} href="mailto:contact@vyntics.com">
            <span aria-hidden="true">→</span> contact@vyntics.com
          </a>

          <address className={styles.contactDetails}>
            <a href={siteConfig.mapHref} target="_blank" rel="noreferrer" aria-label={`Open ${siteConfig.address} in Google Maps`}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></svg>
              {siteConfig.address}
            </a>
          </address>
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
          onInput={() => {
            if (submitState === "success" || submitState === "error") {
              setSubmitState("idle");
              setFeedback("");
            }
          }}
          noValidate={false}
        >
          <div className={styles.twoColumns}>
            <label>
              <span>Full name</span>
              <input name="name" type="text" autoComplete="name" required placeholder="Your name" />
            </label>
            <label>
              <span>Work email</span>
              <input name="email" type="email" autoComplete="email" required placeholder="you@company.com" />
            </label>
          </div>

          <div className={styles.twoColumns}>
            <label>
              <span>Company <small>Optional</small></span>
              <input name="company" type="text" autoComplete="organization" placeholder="Company name" />
            </label>
            <label>
              <span>Subject</span>
              <input name="subject" type="text" required placeholder="How can we help?" />
            </label>
          </div>

          <label>
            <span>Project details</span>
            <textarea name="message" required rows={5} placeholder="Tell us about your project, challenge, or goal." />
          </label>

          <SendButton
            type="submit"
            state={submitState}
            disabled={submitState === "submitting" || submitState === "success"}
          >
              {submitState === "submitting" ? "Sending…" : submitState === "success" ? "Message sent" : submitState === "error" ? "Try again" : submitLabel}
          </SendButton>

          <p className={`${styles.feedback} ${submitState === "error" ? styles.error : ""}`} role="status" aria-live="polite">
            {feedback}
          </p>
        </form>
      </Container>
    </section>
  );
}
