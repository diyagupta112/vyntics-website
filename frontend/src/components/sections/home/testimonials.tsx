"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState, type FocusEvent } from "react";
import { Container } from "@/components/ui/container";
import styles from "./testimonials.module.css";

type Testimonial = { text: string; name: string; role: string };

const testimonials: Testimonial[] = [
  { text: "This ERP revolutionized our operations, streamlining finance and inventory. The cloud-based platform keeps us productive, even remotely.", name: "Briana Patton", role: "Operations Manager" },
  { text: "Implementing this ERP was smooth and quick. The customizable, user-friendly interface made team training effortless.", name: "Bilal Ahmed", role: "IT Manager" },
  { text: "The support team is exceptional, guiding us through setup and providing ongoing assistance, ensuring our satisfaction.", name: "Saman Malik", role: "Customer Support Lead" },
  { text: "This ERP's seamless integration enhanced our business operations and efficiency. Highly recommended for its intuitive interface.", name: "Omar Raza", role: "CEO" },
  { text: "Its robust features and quick support have transformed our workflow, making us significantly more efficient.", name: "Zainab Hussain", role: "Project Manager" },
  { text: "The smooth implementation exceeded expectations. It streamlined processes, improving overall business performance.", name: "Aliza Khan", role: "Business Analyst" },
  { text: "Our business functions improved with a user-friendly design and positive customer feedback.", name: "Farhan Siddiqui", role: "Marketing Director" },
  { text: "They delivered a solution that exceeded expectations, understanding our needs and enhancing our operations.", name: "Sana Sheikh", role: "Sales Manager" },
  { text: "Using this ERP, our online presence and conversions significantly improved, boosting business performance.", name: "Hassan Ali", role: "E-commerce Manager" },
];

const AUTOPLAY_INTERVAL_MS = 2000;

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d={direction === "left" ? "m12.5 4.5-5.5 5.5 5.5 5.5" : "m7.5 4.5 5.5 5.5-5.5 5.5"} />
    </svg>
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
          <p className={styles.eyebrow}>In their words</p>
          <h2 id="testimonials-title">Straight from our clients</h2>
          <p>Discover how teams streamline their operations with thoughtfully built systems.</p>
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
                  <span className={styles.avatar} aria-hidden="true">
                    {testimonial.name.split(" ").map((part) => part[0]).join("")}
                  </span>
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
