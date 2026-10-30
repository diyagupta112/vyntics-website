"use client";

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

// Repeat the existing reviews so each half fills even a wide viewport.
const marqueeTestimonials = [...testimonials, ...testimonials];

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
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .1 });
    const updateVisibility = () => setPageVisible(!document.hidden);
    observer.observe(marquee);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
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
          ref={marqueeRef}
          className={styles.marquee}
          role="region"
          aria-label="Client testimonials"
          tabIndex={0}
          data-running={inView && pageVisible && !isHovered && !hasFocus}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={() => setHasFocus(true)}
          onBlurCapture={handleBlur}
        >
          <div className={styles.viewport}>
            <div className={styles.track}>
              {[0, 1].map(group => (
                <div className={styles.group} key={group} aria-hidden={group === 1 || undefined}>
                  {marqueeTestimonials.map((testimonial, index) => (
                    <article
                      className={`${styles.card}${index >= testimonials.length ? ` ${styles.duplicate}` : ""}`}
                      aria-hidden={index >= testimonials.length || undefined}
                      key={`${testimonial.name}-${index}`}
                    >
                      <blockquote>“{testimonial.text}”</blockquote>
                      <footer>
                        <TestimonialMark testimonial={testimonial} />
                        <div className={styles.author}>
                          <strong>{testimonial.name}</strong>
                          <span>{testimonial.role}</span>
                        </div>
                      </footer>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
