"use client";

import { useState, type FormEvent } from "react";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import styles from "./contact-cta.module.css";

type SubmitState = "idle" | "submitting" | "success" | "error";

function SubmitIcon({ success }: { success: boolean }) {
  return (
    <svg className={styles.submitIcon} viewBox="0 0 24 24" aria-hidden="true">
      {success ? (
        <path className={styles.checkPath} d="m5 12.5 4.25 4.25L19 7" pathLength="1" />
      ) : (
        <path d="M4 12h15m-5.5-5.5L19 12l-5.5 5.5" />
      )}
    </svg>
  );
}

type ContactCtaProps = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  sectionId?: string;
};

export function ContactCta({
  eyebrow = "Get in touch",
  title = "Let's look at your data together",
  intro = "Book a free 30-minute strategy session. No pitch decks, no sales team—just a direct conversation about your data and AI challenges with our experts.",
  sectionId = "contact",
}: ContactCtaProps = {}) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [feedback, setFeedback] = useState("");

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
      const response = await fetch(`${apiBaseUrl}/contact-us`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 id={`${sectionId}-title`}>{title}</h2>
          <p className={styles.intro}>{intro}</p>

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

          <button
            className={styles.submitButton}
            type="submit"
            data-state={submitState}
            disabled={submitState === "submitting" || submitState === "success"}
          >
            <span className={styles.sendSweep} aria-hidden="true" />
            <span className={styles.submitContent}>
              {submitState === "submitting" ? "Sending…" : submitState === "success" ? "Message sent" : "Send message"}
              <SubmitIcon success={submitState === "success"} />
            </span>
          </button>

          <p className={`${styles.feedback} ${submitState === "error" ? styles.error : ""}`} role="status" aria-live="polite">
            {feedback}
          </p>
        </form>
      </Container>
    </section>
  );
}
