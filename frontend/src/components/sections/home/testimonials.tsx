"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState, type FocusEvent } from "react";
import { Container } from "@/components/ui/container";
import styles from "./testimonials.module.css";

type Testimonial = {
  text: string;
  name: string;
  role: string;
  company?: {
    name: string;
    logoClass: string;
  };
};

const testimonials: Testimonial[] = [
  {
    text: "Arun and the Vyntics team transformed our data workflows. They developed a seamless, automated ingestion engine that streamlined our entire reporting process while remaining timely and budget-conscious. Their technical mastery of Cloud Data Warehousing makes them an indispensable partner.",
    name: "Mona McCormick",
    role: "Business & Royalty Analytics, SMGQ Law",
    company: { name: "SMGQ Law", logoClass: styles.smgqLogo },
  },
  {
    text: "Vyntics team seamlessly transitioned our workforce to a fully remote AWS environment. Their technical precision and reliability made a complex migration feel effortless. they will be our first choice as we expand into advanced data analytics.",
    name: "Sergio Iturbe",
    role: "Managing Director, ITURBE PROPERTIES",
    company: { name: "Iturbe Properties", logoClass: styles.iturbeLogo },
  },
  {
    text: "Vyntics transformed our raw data into a powerful decision-making tool. Arun’s proactive approach to understanding our requirements resulted in comprehensive dashboards that far exceeded our expectations. Their technical intensity and commitment to excellence made them a pleasure to work with. A top-tier partner for data analytics.",
    name: "Balazs",
    role: "Founder & CEO, Rollout IT",
    company: { name: "Rollout IT", logoClass: styles.rolloutLogo },
  },
];

const AUTOPLAY_INTERVAL_MS = 2000;

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d={direction === "left" ? "m12.5 4.5-5.5 5.5 5.5 5.5" : "m7.5 4.5 5.5 5.5-5.5 5.5"} />
    </svg>
  );
}

function TestimonialMark({ testimonial }: { testimonial: Testimonial }) {
  const company = testimonial.company;

  if (company) {
    return (
      <span className={`${styles.avatar} ${styles.companyAvatar}`} aria-label={`${company.name} logo`}>
        <span className={`${styles.companyLogo} ${company.logoClass}`} aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className={styles.avatar} aria-hidden="true">
      {testimonial.name.split(" ").map((part) => part[0]).join("")}
    </span>
  );
}

export function Testimonials() {
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

  return (
    <section id="testimonials" className={styles.section} aria-labelledby="testimonials-title">
      <Container>
        <div className={styles.headingBlock}>
          <p className={styles.eyebrow}>In their own words</p>
          <h2 id="testimonials-title">Straight from our customers</h2>
          <p>Learn how carefully designed systems help teams optimize their operations.</p>
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
                <article className={`${styles.card} ${position.className}`} aria-hidden={position.distance !== 0 || undefined} key={testimonial.name}>
                  <TestimonialMark testimonial={testimonial} />
                  <blockquote>“{testimonial.text}”</blockquote>
                  <footer>- {testimonial.name}, <span>{testimonial.role}</span></footer>
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
