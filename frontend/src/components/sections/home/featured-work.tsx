import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ThreeDCard } from "@/components/ui/three-d-card";
import styles from "./featured-work.module.css";

const proofPoints = ["20K+ documents", "100% answers cited", "Daily freshness"] as const;

const stack = [
  "AWS Batch + Fargate",
  "Amazon S3",
  "Pinecone",
  "Supabase / PostgreSQL",
  "FastAPI",
  "OpenAI",
] as const;

export function FeaturedWork() {
  return (
    <section id="work" className={styles.section} aria-labelledby="featured-work-title">
      <Container>
        <div className={styles.headingBlock}>
          <p className={styles.eyebrow}>Featured work · Custom AI / RAG</p>
          <h2 id="featured-work-title">Give your business an edge with AI</h2>
          <p>
            We build production AI grounded in your own data—accurate, cited, and
            ready to ship. Here&apos;s one we put into production.
          </p>
        </div>

        <article className={`${styles.card} ${styles.cardGrid}`}>
            <ThreeDCard className={styles.visual}>
              <Image
                src="/images/compliance-rag-chatbot.webp"
                alt="The compliance chatbot returning a structured and cited answer"
                fill
                sizes="(max-width: 900px) 100vw, 54vw"
              />
              <span className={styles.projectType}>Case study · AI / RAG</span>
            </ThreeDCard>

            <div className={styles.content}>
              <div>
                <div className={styles.leadMetric}>
                  <strong>95%+</strong>
                  <span>correct answers</span>
                </div>
                <p className={styles.client}>Compliance-EdTech · Confidential</p>
                <h3>Compliance RAG Chatbot</h3>
                <p className={styles.summary}>
                  A production retrieval-augmented chatbot answering regulatory and
                  compliance questions with a verified citation on every response.
                </p>
              </div>

              <ul className={styles.proofPoints} aria-label="Project outcomes">
                {proofPoints.map((point) => <li key={point}>{point}</li>)}
              </ul>

              <div className={styles.cardFooter}>
                <ul className={styles.stack} aria-label="Technology stack">
                  {stack.map((technology) => <li key={technology}>{technology}</li>)}
                </ul>
                <Link
                  className={styles.caseStudyLink}
                  href="/case-studies/compliance-rag-chatbot"
                >
                  Read the full case study <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
        </article>
      </Container>
    </section>
  );
}
