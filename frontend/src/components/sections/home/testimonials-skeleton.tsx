import { Container } from "@/components/ui/container";
import { Skeleton, SkeletonLines } from "@/components/ui/skeleton";
import styles from "./testimonials.module.css";

// Same section, heading and card sizes as the loaded testimonials marquee, so nothing shifts when it arrives.
export function TestimonialsSkeleton() {
  return (
    <section id="testimonials" className={styles.section} aria-labelledby="testimonials-title" aria-busy="true">
      <Container>
        <div className={styles.headingBlock}>
          <p className={styles.eyebrow}>In their own words</p>
          <h2 id="testimonials-title">Straight from our clients</h2>
          <p>Learn how carefully designed systems help teams optimize their operations</p>
        </div>
        <div className={styles.marquee} role="status" aria-label="Loading client testimonials">
          <div className={styles.viewport}>
            <div className={styles.track}>
              <div className={styles.group} aria-hidden="true">
                {[0, 1, 2].map((index) => (
                  <article className={styles.card} key={index}>
                    <SkeletonLines widths={["100%", "94%", "98%", "70%"]} />
                    <footer>
                      <Skeleton style={{ width: "2.75rem", height: "2.75rem", borderRadius: "50%", flex: "0 0 auto" }} />
                      <div className={styles.author}><Skeleton style={{ width: "8rem" }} /><Skeleton style={{ width: "6rem", height: ".7rem" }} /></div>
                    </footer>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
