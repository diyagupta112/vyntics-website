import { FaqContent } from "@/components/pages/faq-content";
import { cloudQuestions, cloudFaqAnswers } from "./cloud-foundations-content";
import shared from "@/app/(marketing)/recognitions/page.module.css";
import styles from "./cloud-faq.module.css";

// Questions follow the Cloud Foundations SEO plan; answers are first-draft service copy.
const cloudFaqs = cloudQuestions.map((question, index) => ({ question, answer: cloudFaqAnswers[index] }));

export function CloudFaq() {
  return <section className={shared.section} aria-labelledby="cloud-faq-title" data-cloud-section="FAQ">
    <FaqContent
      heading={<>
        <h2 id="cloud-faq-title">Frequently Asked Questions</h2>
        <p className={styles.introduction}>Practical answers about cloud consulting, migration, ongoing support, and choosing the right platform.</p>
        <div className={styles.contactFallback}>
          <p className={styles.contactPrompt}>Can’t find the answer you’re looking for?</p>
          <p className={styles.contactHelp}>Reach out to us at <a className={shared.faqEmail} href="mailto:contact@vyntics.com">contact@vyntics.com</a> and we’ll be happy to help.</p>
        </div>
      </>}
      items={cloudFaqs}
      name="cloud-solutions-faq"
      label="Cloud solutions questions"
    />
  </section>;
}
