import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import styles from "@/components/pages/listing-page.module.css";

export const metadata: Metadata = {
  title: "Rewards",
  description: "The contributions, growth, and outcomes Vyntics recognizes.",
};

const recognition = [
  { title: "Client impact", text: "Work that removes friction, improves decisions, or creates a measurable operational result." },
  { title: "Technical craft", text: "Thoughtful engineering that makes systems clearer, safer, more reliable, and easier to own." },
  { title: "Team contribution", text: "Sharing context, helping others improve, and strengthening the way the whole team delivers." },
  { title: "Continuous growth", text: "Developing new capabilities and applying what was learned to increasingly meaningful work." },
] as const;

export default function RewardsPage() {
  return (
    <>
      <section className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>Rewards & recognition</p>
          <h1>Recognition should follow meaningful contribution.</h1>
          <p>At Vyntics, we value the work that improves client outcomes, strengthens engineering quality, and helps the team grow together.</p>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <div className={styles.sectionHeading}>
            <p className={styles.label}>What matters</p>
            <h2>The contributions we choose to recognize.</h2>
          </div>
          <div className={styles.cardGrid}>
            {recognition.map((item) => (
              <article className={styles.card} key={item.title}>
                <p className={styles.cardMeta}>Vyntics values</p>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

