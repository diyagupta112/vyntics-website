"use client";

import { useEffect, useState, type FormEvent } from "react";
import SendButton from "@/components/ui/send-button";
import styles from "./contact-cta.module.css";

type SubmitState = "idle" | "submitting" | "success" | "error";
const SENT_STATE_DURATION_MS = 5 * 1000;
const SEND_ANIMATION_DURATION_MS = 450;

/** The site's contact form. Used by the home page call to action, the service pages and the Contact Us page. */
export function ContactForm({ submitLabel = "Send message" }: { submitLabel?: string }) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (submitState !== "success") return;
    const timer = window.setTimeout(() => {
      setSubmitState("idle");
      setFeedback("");
    }, SENT_STATE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [submitState]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitState === "submitting" || submitState === "success") return;
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
      }), new Promise<void>((resolve) => window.setTimeout(resolve, SEND_ANIMATION_DURATION_MS))]);

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
    <form
          className={styles.form}
          onSubmit={handleSubmit}
          onInput={() => {
            if (submitState === "error") {
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
  );
}
