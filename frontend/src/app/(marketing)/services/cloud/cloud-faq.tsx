"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/container";
import { cloudQuestions } from "./cloud-foundations-content";
import styles from "./cloud-faq.module.css";

export function CloudFaq() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();
  const id = useId();
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const target = event.key === "ArrowDown" ? (index + 1) % cloudQuestions.length
      : event.key === "ArrowUp" ? (index - 1 + cloudQuestions.length) % cloudQuestions.length
      : event.key === "Home" ? 0 : event.key === "End" ? cloudQuestions.length - 1 : null;
    if (target === null) return;
    event.preventDefault();
    triggers.current[target]?.focus();
  }

  return (
    <section className={styles.section} aria-labelledby="cloud-faq-title" data-cloud-section="FAQ">
      <Container className={styles.layout}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>FREQUENTLY ASKED QUESTIONS</p>
          <h2 id="cloud-faq-title">Questions, answered.</h2>
          <p className={styles.introduction}>Have questions about our services, approach, or what working with Vyntics looks like? Find answers to some of the questions we hear most often.</p>
          <div className={styles.contactFallback}>
            <p className={styles.contactPrompt}>Can’t find the answer you’re looking for?</p>
            <p className={styles.contactHelp}>Reach out to us at <a href="mailto:contact@vyntics.com">contact@vyntics.com</a> and we’ll be happy to help.</p>
          </div>
        </header>
        <div className={styles.list}>
          {cloudQuestions.map((question, index) => {
            const open = expanded === index;
            const triggerId = `${id}-question-${index}`;
            const panelId = `${id}-answer-${index}`;
            return (
              <div className={styles.item} key={question}>
                <h3>
                  <button
                    ref={element => { triggers.current[index] = element; }}
                    id={triggerId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setExpanded(open ? null : index)}
                    onKeyDown={event => navigate(event, index)}
                    className={styles.trigger}
                  >
                    <span>{question}</span>
                    <svg viewBox="0 0 20 20" aria-hidden="true" className={styles.chevron}>
                      <path d="m5 7.5 5 5 5-5" />
                    </svg>
                  </button>
                </h3>
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  aria-hidden={!open}
                  className={styles.panel}
                  initial={false}
                  animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.25, ease: "easeInOut" }}
                >
                  <p>Answer to be added.</p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
