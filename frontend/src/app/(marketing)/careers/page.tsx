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
import { Container } from "@/components/ui/container";
import { getCareers } from "@/lib/careers";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Careers",
  description: "Explore current opportunities and learn about joining the Vyntics team.",
};

const reasons = [
  { number: "01", icon: "impact", title: "Meaningful contribution", text: "Work with a team focused on solving useful problems and turning thoughtful ideas into dependable outcomes." },
  { number: "02", icon: "growth", title: "Room to grow", text: "Develop your craft through hands-on work, shared context, feedback, and new technical challenges." },
  { number: "03", icon: "team", title: "Work together", text: "Bring your perspective to a team that values clear communication, curiosity, and considered decisions." },
  { number: "04", icon: "ownership", title: "Make your mark", text: "Take part in the work, contribute ideas, and help shape how strong solutions are delivered." },
] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

function ReasonIcon({ type }: { type: (typeof reasons)[number]["icon"] }) {
  if (type === "growth") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9m7 10V5m7 14v-7M3 19h18" /></svg>;
  if (type === "team") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2.5 19c.5-4 2.3-6 5.5-6s5 2 5.5 6M14 14c3.8-.5 6.3 1.2 7 4.5" /></svg>;
  if (type === "ownership") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.2 5.3L20 10.5l-5.3 2.2L12.5 18 10.3 12.7 5 10.5l5.3-2.2L12 3Z" /><path d="m18.5 16 .8 2 .2.5.5.2 2 .8-2 .8-.5.2-.2.5-.8 2-.8-2-.2-.5-.5-.2-2-.8 2-.8.5-.2.2-.5.8-2Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8m0-12.8-2.8 2.8m-7.2 7.2-2.8 2.8" /><circle cx="12" cy="12" r="3.5" /></svg>;
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
          <div className={styles.openingTopline}>
            <span>{career.department}</span>
            <span>{career.employment_type}</span>
          </div>
          <h3><Link href={`/careers/${encodeURIComponent(career.slug)}`}>{career.title}</Link></h3>
          <p>{career.short_description}</p>
          <ul aria-label="Role details">
            <li>{career.location}</li>
            <li>{career.experience}</li>
          </ul>
          <Link className={styles.openingLink} href={`/careers/${encodeURIComponent(career.slug)}`}>
            View role <ArrowIcon />
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
            <h1 id="careers-title">Do meaningful work. Keep growing.</h1>
            <p>Join a team where thoughtful ideas, practical skills, and a willingness to contribute can make a real difference.</p>
            <CurrentOpeningsLink className={styles.primaryButton}>View Current Openings <ArrowIcon /></CurrentOpeningsLink>
          </RevealBlock>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.reasonsSection}`} aria-labelledby="why-join-title">
        <Container>
          <RevealBlock className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Why join us</p>
            <h2 id="why-join-title">A place to contribute, learn, and build with care.</h2>
            <p>Bring your perspective to work that rewards curiosity, responsibility, and steady growth.</p>
          </RevealBlock>
          <div className={styles.reasonGrid}>
            {reasons.map((reason, index) => (
              <RevealArticle className={styles.reasonCard} delay={index * 0.06} key={reason.number}>
                <div className={styles.reasonCardTop}>
                  <span className={styles.reasonIcon}><ReasonIcon type={reason.icon} /></span>
                  <span className={styles.reasonNumber}>{reason.number}</span>
                </div>
                <div><h3>{reason.title}</h3><p>{reason.text}</p></div>
              </RevealArticle>
            ))}
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.testimonialsSection}`} aria-labelledby="team-says-title">
        <Container className={styles.testimonialsLayout}>
          <RevealBlock className={styles.stickyHeading}>
            <div>
              <h2 id="team-says-title">Hear from our team.</h2>
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
          </RevealBlock>
          <RevealBlock delay={0.08}><TestimonialCarousel testimonials={teamTestimonials} /></RevealBlock>
        </Container>
      </section>

      <section id="current-openings" className={`${styles.section} ${styles.openingsSection}`} aria-labelledby="openings-title">
        <Container>
          <RevealBlock className={`${styles.sectionHeading} ${styles.openingsHeading}`}>
            <p className={styles.eyebrow}>Current openings</p>
            <h2 id="openings-title">Find the role where you can do your best work.</h2>
            <p>Explore the opportunities currently available at Vyntics.</p>
          </RevealBlock>
          <Suspense fallback={<OpeningsSkeleton />}><CareerOpenings /></Suspense>
        </Container>
      </section>

      <section className={styles.contactCta} aria-labelledby="career-contact-title">
        <Container>
          <RevealBlock className={styles.contactInner}>
            <p className={styles.eyebrow}>Don&apos;t see your role?</p>
            <h2 id="career-contact-title">No problem. We&apos;re always looking for bright minds.</h2>
            <p>If you think you&apos;d be a great fit for Vyntics, we&apos;d still love to hear from you.</p>
            <a className={styles.contactEmail} href="mailto:contact@vyntics.com?subject=Career%20at%20Vyntics">contact@vyntics.com</a>
            <a className={styles.contactButton} href="mailto:contact@vyntics.com?subject=Career%20at%20Vyntics">Get in touch <ArrowIcon /></a>
          </RevealBlock>
        </Container>
      </section>
    </>
  );
}
