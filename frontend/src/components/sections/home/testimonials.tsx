"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import { Container } from "@/components/ui/container";
import styles from "./testimonials.module.css";

type Testimonial = {
  text: string;
  name: string;
  role: string;
  company?: {
    name: string;
    logoSrc: string;
    logoWidth: number;
    logoHeight: number;
    logoClass: string;
  };
};

const testimonials: Testimonial[] = [
  {
    text: "Arun and the Vyntics team transformed our data workflows. They developed a seamless, automated ingestion engine that streamlined our entire reporting process while remaining timely and budget-conscious. Their technical mastery of Cloud Data Warehousing makes them an indispensable partner.",
    name: "Mona McCormick",
    role: "Business & Royalty Analytics, SMGQ Law",
    company: { name: "SMGQ Law", logoSrc: "/images/clients/smgqlogo-transparent.png", logoWidth: 1549, logoHeight: 1015, logoClass: styles.smgqLogo },
  },
  {
    text: "Vyntics team seamlessly transitioned our workforce to a fully remote AWS environment. Their technical precision and reliability made a complex migration feel effortless. they will be our first choice as we expand into advanced data analytics.",
    name: "Sergio Iturbe",
    role: "Managing Director, ITURBE PROPERTIES",
    company: { name: "Iturbe Properties", logoSrc: "/images/clients/iturbelogo-transparent.png", logoWidth: 1774, logoHeight: 887, logoClass: styles.iturbeLogo },
  },
  {
    text: "Vyntics transformed our raw data into a powerful decision-making tool. Arun’s proactive approach to understanding our requirements resulted in comprehensive dashboards that far exceeded our expectations. Their technical intensity and commitment to excellence made them a pleasure to work with. A top-tier partner for data analytics.",
    name: "Balazs",
    role: "Founder & CEO, Rollout IT",
    company: { name: "Rollout IT", logoSrc: "/images/clients/rolloutitlogo-transparent.png", logoWidth: 2035, logoHeight: 773, logoClass: styles.rolloutLogo },
  },
];

// Reuse the three real reviews so cards can enter and exit beyond both edges.
const carouselTestimonials = Array.from({ length: 3 }, () => testimonials).flat();
const AUTOPLAY_INTERVAL_MS = 1000;

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
      <span className={styles.companyAvatar}>
        <Image
          alt={`${company.name} logo`}
          className={`${styles.companyLogo} ${company.logoClass}`}
          height={company.logoHeight}
          sizes="7rem"
          src={company.logoSrc}
          width={company.logoWidth}
        />
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
  const carouselRef = useRef<HTMLDivElement>(null);
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
    if (reduceMotion || isPaused || !inView || !pageVisible) return;

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
                <motion.article className={`${styles.card} ${position.className}`} aria-hidden={position.distance !== 0 || undefined} key={`${testimonial.name}-${index}`}
                  initial={false}
                  animate={position.animation}
                  style={{ zIndex: position.zIndex }}
                  transition={reduceMotion ? { duration: 0 } : {
                    type: "spring", stiffness: 220, damping: 26, mass: .8,
                    delay: Math.min(Math.abs(position.distance), 2) * .035,
                    opacity: { duration: .2 },
                  }}>
                  <TestimonialMark testimonial={testimonial} />
                  <blockquote>“{testimonial.text}”</blockquote>
                  <footer>- {testimonial.name}, <span>{testimonial.role}</span></footer>
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
