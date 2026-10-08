import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  CurrentOpeningsLink,
  RevealArticle,
  RevealBlock,
} from "@/components/sections/careers/careers-interactions";
import { TestimonialCarousel } from "@/components/sections/careers/testimonial-carousel";
import { teamTestimonials } from "@/components/sections/careers/testimonial-data";
import { WhyJoinScroll } from "@/components/sections/careers/why-join-scroll";
import { Container } from "@/components/ui/container";
import { getCareers } from "@/lib/careers";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Careers",
  description: "Explore current opportunities and learn about joining the Vyntics team.",
};

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

function OpeningsSkeleton() {
  return (
    <div className={styles.openingsGrid} aria-label="Loading current openings" aria-busy="true">
      {[0, 1].map((item) => <div className={styles.skeletonCard} key={item}><span /><span /><span /></div>)}
    </div>
  );
}

async function CareerOpenings() {
  const result = await getCareers();

  if (result.status === "error") {
    return (
      <div className={styles.stateCard} role="status">
        <p className={styles.stateLabel}>Unable to load openings</p>
        <h3>We couldn&apos;t retrieve the latest roles.</h3>
        <p>Please try again, or send your profile to us directly.</p>
        <Link href="/careers#current-openings">Try again <ArrowIcon /></Link>
      </div>
    );
  }

  if (result.careers.length === 0) {
    return (
      <div className={styles.stateCard} role="status">
        <p className={styles.stateLabel}>No current openings</p>
        <h3>There isn&apos;t a listed role right now.</h3>
        <p>New opportunities will appear here when they become available.</p>
      </div>
    );
  }

  return (
    <div className={styles.openingsGrid}>
      {result.careers.map((career, index) => (
        <RevealArticle
          className={styles.openingCard}
          delay={Math.min(0.06 * index, 0.18)}
          key={career.id}
        >
          <Link className={styles.openingCardLink} href={`/careers/${encodeURIComponent(career.slug)}`}>
            <div className={styles.openingTopline}>
              <span>{career.department}</span>
              <span>{career.employment_type}</span>
            </div>
            <h3>{career.title}</h3>
            <p>{career.short_description}</p>
            <ul aria-label="Role details">
              <li>{career.location}</li>
              <li>{career.experience}</li>
            </ul>
            <span className={styles.openingLink}>
              View role <ArrowIcon />
            </span>
          </Link>
        </RevealArticle>
      ))}
    </div>
  );
}

export default function CareersPage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="careers-title">
        <div className={styles.heroImage} aria-hidden="true" />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <Container className={styles.heroInner}>
          <RevealBlock className={styles.heroCopy}>
            <p className={styles.eyebrow}>Join Vyntics</p>
            <h1 id="careers-title">Join a team solving problems with real impact.</h1>
            <p>Bring thoughtful ideas, practical skills, and a willingness to contribute as we solve problems that matter.</p>
            <CurrentOpeningsLink className={styles.primaryButton}>View Current Openings <ArrowIcon /></CurrentOpeningsLink>
          </RevealBlock>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.reasonsSection}`} aria-labelledby="why-join-title">
        <Container>
          <RevealBlock className={styles.reasonsHeading}>
            <h2 id="why-join-title">Why Join Vyntics?</h2>
            <p>Work on meaningful problems, learn by building, and grow alongside people who care about doing great work.</p>
          </RevealBlock>

          <WhyJoinScroll />
        </Container>
      </section>

      <section className={`${styles.section} ${styles.testimonialsSection}`} aria-labelledby="team-stories-title">
        <Container>
          <RevealBlock className={styles.chapterHeading}>
            <h2 id="team-stories-title">From the People at Vyntics</h2>
            <p>A glimpse into the experience of working at Vyntics, from the people who know it best.</p>
          </RevealBlock>

          <RevealBlock className={styles.testimonialsLayout}>
            <div className={styles.stickyHeading}>
              <div>
                <h3>Hear from our team.</h3>
                <p>First-hand perspectives from the people building, learning, and growing with Vyntics.</p>
              </div>
              <div className={styles.teamThemes}>
                <p>What comes through</p>
                <ul>
                  <li>Space to explore ideas</li>
                  <li>Ownership through building</li>
                  <li>Learning from each other</li>
                </ul>
              </div>
            </div>
            <div><TestimonialCarousel testimonials={teamTestimonials} /></div>
          </RevealBlock>
        </Container>
      </section>

      <section id="current-openings" className={`${styles.section} ${styles.openingsSection}`} aria-labelledby="openings-title">
        <Container>
          <RevealBlock className={`${styles.sectionHeading} ${styles.openingsHeading}`}>
            <p className={styles.eyebrow}>Current openings</p>
            <h2 id="openings-title">Find Your Place Here</h2>
            <p>Explore the opportunities currently available at Vyntics.</p>
          </RevealBlock>
          <Suspense fallback={<OpeningsSkeleton />}><CareerOpenings /></Suspense>
        </Container>
      </section>

      <section className={styles.contactCta} aria-labelledby="career-contact-title">
        <Container>
          <RevealBlock className={styles.contactInner}>
            <p className={styles.eyebrow}>Don&apos;t see the right role?</p>
            <h2 id="career-contact-title">No problem. We&apos;re always looking for bright minds.</h2>
            <p>If you think you&apos;d be a great fit for Vyntics, we&apos;d still love to hear from you.</p>
            <span className={styles.contactEmail}>contact@vyntics.com</span>
          </RevealBlock>
        </Container>
      </section>
    </>
  );
}
