import Link from "next/link";
import { canonicalServiceHref } from "@/content/service-route-map";
import { Container } from "@/components/ui/container";
import { cloudServiceList } from "./cloud-services";
import type { CanonicalCloudService } from "./canonical-cloud-services";
import styles from "./cloud-service-page.module.css";

function cloudHref(slug: string) {
  const legacy = `/services/cloud/${slug}`;
  const canonical = canonicalServiceHref(legacy);
  return canonical === legacy ? `/services/cloud-foundations/${slug}` : canonical;
}

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

function CloudContext({ current, serviceList }: { current: CanonicalCloudService; serviceList: readonly CanonicalCloudService[] }) {
  return (
    <nav className={styles.cloudContext} aria-label="Cloud Foundations services">
      <Container>
        <div className={styles.breadcrumb}><Link href="/services/cloud-foundations">Cloud Foundations</Link><span aria-hidden="true">/</span><span>{current.title}</span></div>
        <ul>
          {serviceList.map((service) => (
            <li key={service.slug}>
              <Link href={cloudHref(service.slug)} aria-current={service.slug === current.slug ? "page" : undefined}>
                <span>{service.number}</span>{service.title}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  );
}

export function CloudServicePage({ service, serviceList = cloudServiceList }: { service: CanonicalCloudService; serviceList?: readonly CanonicalCloudService[] }) {
  const nextService = serviceList.find(item => item.slug === service.nextSlug) ?? serviceList[0];

  return (
    <>
      <CloudContext current={service} serviceList={serviceList} />

      <header className={styles.hero}>
        <Container className={styles.heroGrid}>
          <div>
            <p className={styles.eyebrow}>Cloud Foundations · {service.number}</p>
            <h1>{service.title}</h1>
          </div>
          <div className={styles.heroStatement}>
            <h2>{service.headline}</h2>
            <p>{service.summary}</p>
            <Link href="/#contact">Discuss this service <ArrowIcon /></Link>
          </div>
        </Container>
      </header>

      <>
        <section className={styles.meaning} aria-labelledby={`${service.slug}-meaning`}>
          <Container className={styles.meaningGrid}>
            <p className={styles.eyebrow}>What it means</p>
            <div><h2 id={`${service.slug}-meaning`}>{service.title}, in practical terms.</h2><p>{service.meaning}</p></div>
          </Container>
        </section>

        <section className={styles.problemHelp} aria-labelledby={`${service.slug}-problems`}>
          <Container>
            <header className={styles.sectionHeading}>
              <p className={styles.eyebrow}>Where the work helps</p>
              <h2 id={`${service.slug}-problems`}>Move from the operating problem to a clear area of action.</h2>
            </header>
            <div className={styles.problemHelpGrid}>
              <div><h3>Problems it addresses</h3><ul>{service.problems.map((problem) => <li key={problem}>{problem}</li>)}</ul></div>
              <div><h3>How Vyntics can help</h3><ul>{service.help.map((item) => <li key={item}>{item}</li>)}</ul></div>
            </div>
          </Container>
        </section>

        <section className={styles.workAreas} aria-labelledby={`${service.slug}-work-areas`}>
          <Container>
            <header className={styles.sectionHeading}>
              <p className={styles.eyebrow}>Areas of work</p>
              <h2 id={`${service.slug}-work-areas`}>What an engagement can involve.</h2>
            </header>
            <div className={styles.workAreaList}>
              {service.workAreas.map((area, index) => (
                <article key={area.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{area.title}</h3><p>{area.text}</p></article>
              ))}
            </div>
          </Container>
        </section>

        <section className={styles.approach} aria-labelledby={`${service.slug}-approach`}>
          <Container className={styles.approachGrid}>
            <header className={styles.approachHeading}>
              <p className={styles.eyebrow}>How the work can progress</p>
              <h2 id={`${service.slug}-approach`}>A deliberate path from understanding to operation.</h2>
              <p>The sequence adapts to the environment, but each stage should produce a clearer decision or an operable result.</p>
            </header>
            <ol>
              {service.approach.map((step, index) => (
                <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>
              ))}
            </ol>
          </Container>
        </section>

        {service.technologies.length > 0 && (
          <section className={styles.technologies} aria-labelledby={`${service.slug}-technologies`}>
            <Container className={styles.technologyGrid}>
              <div><p className={styles.eyebrow}>Relevant toolkit</p><h2 id={`${service.slug}-technologies`}>Tools selected around the environment.</h2><p>These technologies are part of the existing Vyntics toolkit. The service does not depend on using every one of them.</p></div>
              <ul>{service.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
            </Container>
          </section>
        )}
      </>

      <section className={styles.continue} aria-labelledby={`${service.slug}-continue`}>
        <Container className={styles.continueGrid}>
          <Link className={styles.nextService} href={cloudHref(nextService.slug)}>
            <span>Next Cloud service · {nextService.number}</span>
            <strong id={`${service.slug}-continue`}>{nextService.title}</strong>
            <ArrowIcon />
          </Link>
          <div className={styles.contactCta}>
            <p>Have a {service.title.toLowerCase()} requirement?</p>
            <h2>Start with the environment you have and what needs to change.</h2>
            <div><Link href="/#contact">Start a conversation <ArrowIcon /></Link><Link href="/case-studies">View case studies</Link></div>
          </div>
        </Container>
      </section>
    </>
  );
}
