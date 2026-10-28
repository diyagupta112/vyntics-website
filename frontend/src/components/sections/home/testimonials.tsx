"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import { Container } from "@/components/ui/container";
import type { Testimonial } from "@/lib/testimonials";
import styles from "./testimonials.module.css";

const AUTOPLAY_INTERVAL_MS = 1000;

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
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselTestimonials = testimonials.length === 0
    ? []
    : Array.from({ length: Math.max(testimonials.length, 6) }, (_, index) => testimonials[index % testimonials.length]);
  const reduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const isPaused = isHovered || hasFocus;

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .15 });
    const updateVisibility = () => setPageVisible(!document.hidden);
    observer.observe(carousel);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || isPaused || !inView || !pageVisible || carouselTestimonials.length === 0) return;

    const autoplay = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % carouselTestimonials.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(autoplay);
  }, [currentIndex, isPaused, reduceMotion, inView, pageVisible]);

  const move = (step: number) => {
    setCurrentIndex((index) => (index + step + carouselTestimonials.length) % carouselTestimonials.length);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
  };

  const getPosition = (index: number) => {
    let distance = (index - currentIndex + carouselTestimonials.length) % carouselTestimonials.length;
    if (distance > Math.floor(carouselTestimonials.length / 2)) distance -= carouselTestimonials.length;
    const depth = Math.abs(distance);
    const className = distance === -2 ? styles.farLeft : distance === -1 ? styles.left
      : distance === 0 ? styles.active : distance === 1 ? styles.right : distance === 2 ? styles.farRight : styles.hidden;
    return {
      className,
      distance,
      animation: {
        x: `${-50 + distance * 72}%`,
        y: distance === 0 ? "-58%" : depth === 1 ? "-43%" : "-48%",
        rotate: distance * 4,
        scale: Math.max(.72, 1 - depth * .065),
        opacity: depth > 2 ? 0 : depth === 2 ? .5 : depth === 1 ? .85 : 1,
      },
      zIndex: depth > 2 ? 0 : 5 - depth,
    };
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
          ref={carouselRef}
          className={styles.carousel}
          role="region"
          aria-roledescription="carousel"
          aria-label="Client testimonials"
          aria-live={isPaused ? "polite" : "off"}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={() => setHasFocus(true)}
          onBlurCapture={handleBlur}
        >
          <div className={styles.stage}>
            {carouselTestimonials.map((testimonial, index) => {
              const position = getPosition(index);
              return (
                <motion.article className={`${styles.card} ${position.className}`} aria-hidden={position.distance !== 0 || undefined} key={`${testimonial.id}-${index}`}
                  initial={false}
                  animate={position.animation}
                  style={{ zIndex: position.zIndex }}
                  transition={reduceMotion ? { duration: 0 } : {
                    type: "spring", stiffness: 220, damping: 26, mass: .8,
                    delay: Math.min(Math.abs(position.distance), 2) * .035,
                    opacity: { duration: .2 },
                  }}>
                  <TestimonialMark testimonial={testimonial} />
                  <blockquote>“{testimonial.quote}”</blockquote>
                  <footer>- {testimonial.author_name}{testimonial.author_role && <>, <span>{testimonial.author_role}</span></>}</footer>
                </motion.article>
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
