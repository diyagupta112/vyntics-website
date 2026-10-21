import Image from "next/image";
import { Container } from "@/components/ui/container";
import { CaseStudyScrollReveal } from "./scroll-reveal";
import styles from "./page.module.css";
function ArrowIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>; }
export function CaseStudiesHero() { return (
      <section className={styles.hero} aria-labelledby="case-studies-title">
        <div className={styles.heroCarousel} aria-hidden="true">
          <Image className={styles.heroImage} src="/images/case-studies/team-project-discussion.jpg" alt="Vyntics team discussing a technology project together" fill unoptimized sizes="100vw" loading="eager" fetchPriority="high" />
        </div>
        <div className={styles.heroShade} aria-hidden="true" />
        <Container className={styles.heroInner}>
          <p className={styles.eyebrow}>Case studies</p>
          <h1 id="case-studies-title">Real Challenges Turned into Production-Grade Systems</h1>
          <p className={styles.heroLead}>A look inside the custom software, data platforms, AI and cloud infrastructure we engineer to solve critical business problems.</p>
          <a className={styles.heroAction} href="#featured-case-studies"><span>View case studies</span> <ArrowIcon /></a>
        </Container>
      </section>
); }
export function CaseStudiesIntro() { return (
      <section className={styles.workIntro} aria-labelledby="problems-title">
        <CaseStudyScrollReveal>
        <Container>
          <div className={styles.workIntroContent}>
          <h2 id="problems-title">Problems We&apos;ve Helped Solve</h2>
          <div className={styles.workIntroCard}>
          <span className={styles.workIntroQuote} aria-hidden="true" data-reveal="problems-quote" data-reveal-delay="90">“</span>
          <p className={styles.workIntroCopy} data-reveal="problems-copy" data-reveal-delay="180">Every business challenge needs a tailored approach, but the goal stays the same: turn operational friction into reliable, scalable systems. We work directly with client teams to build the custom software, data infrastructure, cloud environments and intelligent automation that support long-term growth.</p>
          </div>
          </div>
        </Container>
        </CaseStudyScrollReveal>
      </section>
); }
