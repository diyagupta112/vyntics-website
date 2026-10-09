import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import styles from "@/app/(marketing)/recognitions/page.module.css";

type FaqContentProps = {
  heading: ReactNode;
  items: readonly { question: string; answer: string }[];
  name: string;
  label: string;
};

/** The existing Recognitions FAQ presentation, shared without changing its markup. */
export function FaqContent({ heading, items, name, label }: FaqContentProps) {
  return <Container className={styles.faqLayout}>
    <div className={styles.sectionHeading}>{heading}</div>
    <div className={styles.faq} aria-label={label}>
      {items.map((faq, index) => <details name={name} key={faq.question} open={index === 0}>
        <summary><h3>{faq.question}</h3><span aria-hidden="true" className={styles.plus} /></summary>
        <div className={styles.answer}><p>{faq.answer}</p></div>
      </details>)}
    </div>
  </Container>;
}
