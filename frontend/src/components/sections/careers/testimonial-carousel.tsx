"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState, type FocusEvent } from "react";
import type { TeamTestimonial } from "./testimonial-data";
import styles from "./testimonial-carousel.module.css";

const AUTOPLAY_INTERVAL_MS = 2000;

type Props = { testimonials: TeamTestimonial[] };

function Arrow({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d={direction === "previous" ? "m12.5 4.5-5.5 5.5 5.5 5.5" : "m7.5 4.5 5.5 5.5-5.5 5.5"}
      />
    </svg>
  );
}

function PlaybackIcon({ paused }: { paused: boolean }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      {paused ? <path d="m7 5 8 5-8 5V5Z" /> : <path d="M7 5v10M13 5v10" />}
    </svg>
  );
}

export function TestimonialCarousel({ testimonials }: Props) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [autoplayReset, setAutoplayReset] = useState(0);
  const interactionPaused = autoplayPaused || hovered || keyboardFocused;

  useEffect(() => {
    if (interactionPaused || testimonials.length < 2) return;

    const timer = window.setTimeout(() => {
      setDirection(1);
      setIndex((current) => (current + 1) % testimonials.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [autoplayReset, index, interactionPaused, testimonials.length]);

  if (testimonials.length === 0) {
    return (
      <div className={styles.placeholder}>
        <span aria-hidden="true">“</span>
        <h3>Team stories are coming soon.</h3>
        <p>We&apos;re preparing first-hand perspectives from the people who work at Vyntics.</p>
      </div>
    );
  }

  const activeTestimonial = testimonials[index];

  const selectTestimonial = (nextIndex: number, nextDirection?: number) => {
    const normalizedIndex = (nextIndex + testimonials.length) % testimonials.length;
    setDirection(nextDirection ?? (normalizedIndex > index ? 1 : -1));
    setIndex(normalizedIndex);
    setAutoplayReset((value) => value + 1);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocused(false);
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    setKeyboardFocused((event.target as HTMLElement).matches(":focus-visible"));
  };

  return (
    <div
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label="Team testimonials"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={handleFocus}
      onBlurCapture={handleBlur}
    >
      <div className={styles.stage} aria-live={interactionPaused ? "polite" : "off"}>
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.article
            className={styles.card}
            key={activeTestimonial.id}
            custom={direction}
            initial={reduceMotion ? false : { opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * -28 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            aria-label={`${index + 1} of ${testimonials.length}`}
          >
            <div className={styles.portrait}>
              <Image
                src={activeTestimonial.imageUrl}
                alt={activeTestimonial.imageAlt}
                fill
                sizes="(max-width: 600px) calc(100vw - 2rem), (max-width: 900px) 42vw, 22rem"
                style={{ objectPosition: activeTestimonial.imagePosition }}
                priority={index === 0}
              />
            </div>
            <div className={styles.copy}>
              <span className={styles.quoteMark} aria-hidden="true">“</span>
              <blockquote>{activeTestimonial.quote}</blockquote>
              <footer>
                <strong>{activeTestimonial.name}</strong>
                <span>{activeTestimonial.role}</span>
              </footer>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className={styles.carouselFooter}>
        <div className={styles.thumbnails} aria-label="Choose a team testimonial">
          {testimonials.map((testimonial, testimonialIndex) => (
            <button
              type="button"
              className={testimonialIndex === index ? styles.activeThumbnail : ""}
              onClick={() => selectTestimonial(testimonialIndex)}
              aria-label={`Show testimonial from ${testimonial.name}, ${testimonial.role}`}
              aria-current={testimonialIndex === index ? "true" : undefined}
              key={testimonial.id}
            >
              <span>
                <Image
                  src={testimonial.imageUrl}
                  alt=""
                  fill
                  sizes="52px"
                  style={{ objectPosition: testimonial.thumbnailPosition }}
                />
              </span>
            </button>
          ))}
        </div>

        <div className={styles.controls} aria-label="Testimonial carousel controls">
          <span aria-label={`Testimonial ${index + 1} of ${testimonials.length}`}>
            {String(index + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => setAutoplayPaused((paused) => !paused)}
            aria-label={autoplayPaused ? "Resume automatic testimonial rotation" : "Pause automatic testimonial rotation"}
            aria-pressed={autoplayPaused}
          >
            <PlaybackIcon paused={autoplayPaused} />
          </button>
          <button
            type="button"
            onClick={() => selectTestimonial(index - 1, -1)}
            aria-label="Previous team testimonial"
          >
            <Arrow direction="previous" />
          </button>
          <button
            type="button"
            onClick={() => selectTestimonial(index + 1, 1)}
            aria-label="Next team testimonial"
          >
            <Arrow direction="next" />
          </button>
        </div>
      </div>
    </div>
  );
}
