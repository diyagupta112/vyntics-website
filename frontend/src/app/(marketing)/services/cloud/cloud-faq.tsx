import { FaqContent } from "@/components/pages/faq-content";
import { cloudQuestions } from "./cloud-foundations-content";
import shared from "@/app/(marketing)/recognitions/page.module.css";
import styles from "./cloud-faq.module.css";

// Preserve the existing Cloud FAQ content and ordering exactly.
const cloudFaqs = cloudQuestions.map(question => ({ question, answer: "Answer to be added." }));

export function CloudFaq() {
  return <section className={shared.section} aria-labelledby="cloud-faq-title" data-cloud-section="FAQ">
    <FaqContent
      heading={<>
        <p className={styles.eyebrow}>FREQUENTLY ASKED QUESTIONS</p>
        <h2 id="cloud-faq-title">Questions, answered.</h2>
        <p className={styles.introduction}>Have questions about our services, approach, or what working with Vyntics looks like? Find answers to some of the questions we hear most often.</p>
        <div className={styles.contactFallback}>
          <p className={styles.contactPrompt}>Can’t find the answer you’re looking for?</p>
          <p className={styles.contactHelp}>Reach out to us at <a href="mailto:contact@vyntics.com">contact@vyntics.com</a> and we’ll be happy to help.</p>
        </div>
      </>}
      items={cloudFaqs}
      name="cloud-solutions-faq"
      label="Cloud solutions questions"
    />
  </section>;
}
