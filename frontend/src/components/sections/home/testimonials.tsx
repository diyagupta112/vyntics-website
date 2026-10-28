"use client";

import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState, type FocusEvent } from "react";
import { Container } from "@/components/ui/container";
import type { Testimonial } from "@/lib/testimonials";
import styles from "./testimonials.module.css";

const AUTOPLAY_INTERVAL_MS = 2000;

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d={direction === "left" ? "m12.5 4.5-5.5 5.5 5.5 5.5" : "m7.5 4.5 5.5 5.5-5.5 5.5"} />
    </svg>
  );
}

function TestimonialMark({ testimonial }: { testimonial: Testimonial }) {
  if (testimonial.company_logo_url) {
    return (
      <span className={styles.companyAvatar}>
        <Image
          alt={`${testimonial.company_name ?? testimonial.author_name} logo`}
          className={styles.companyLogo}
          height={192}
          sizes="7rem"
          src={testimonial.company_logo_url}
          unoptimized
          width={448}
        />
      </span>
    );
  }

  return (
    <span className={styles.avatar} aria-hidden="true">
      {testimonial.author_name.split(" ").map((part) => part[0]).join("")}
    </span>
  );
}

export function Testimonials({ testimonials }: { testimonials: readonly Testimonial[] }) {
  const reduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const isPaused = isHovered || hasFocus;

  useEffect(() => {
    if (reduceMotion || isPaused) return;

    const autoplay = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % testimonials.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(autoplay);
  }, [currentIndex, isPaused, reduceMotion]);

  const move = (step: number) => {
    setCurrentIndex((index) => (index + step + testimonials.length) % testimonials.length);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
  };

  const getPosition = (index: number) => {
    let distance = (index - currentIndex + testimonials.length) % testimonials.length;
    if (distance > Math.floor(testimonials.length / 2)) distance -= testimonials.length;

    if (distance === -2) return { className: styles.farLeft, distance };
    if (distance === -1) return { className: styles.left, distance };
    if (distance === 0) return { className: styles.active, distance };
    if (distance === 1) return { className: styles.right, distance };
    if (distance === 2) return { className: styles.farRight, distance };
    return { className: styles.hidden, distance };
  };

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className={styles.section} aria-labelledby="testimonials-title">
      <Container>
        <div className={styles.headingBlock}>
          <p className={styles.eyebrow}>In their own words</p>
          <h2 id="testimonials-title">Straight from our clients</h2>
          <p>Learn how carefully designed systems help teams optimize their operations</p>
        </div>

        <div
          className={styles.carousel}
          aria-live={isPaused ? "polite" : "off"}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={() => setHasFocus(true)}
          onBlurCapture={handleBlur}
        >
          <div className={styles.stage}>
            {testimonials.map((testimonial, index) => {
              const position = getPosition(index);
              return (
                <article className={`${styles.card} ${position.className}`} aria-hidden={position.distance !== 0 || undefined} key={testimonial.id}>
                  <TestimonialMark testimonial={testimonial} />
                  <blockquote>“{testimonial.quote}”</blockquote>
                  <footer>- {testimonial.author_name}{testimonial.author_role && <>, <span>{testimonial.author_role}</span></>}</footer>
                </article>
              );
            })}
          </div>

          <div className={styles.controls}>
            <button type="button" onClick={() => move(-1)} aria-label="Previous testimonial"><Arrow direction="left" /></button>
            <button type="button" onClick={() => move(1)} aria-label="Next testimonial"><Arrow direction="right" /></button>
          </div>
        </div>
      </Container>
    </section>
  );
}
