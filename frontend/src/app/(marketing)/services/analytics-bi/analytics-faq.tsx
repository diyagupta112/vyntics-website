import { ServiceFaqContent } from "@/components/pages/service-faq-content";
import { analyticsContent } from "./analytics-bi-content";
import shared from "@/app/(marketing)/recognitions/page.module.css";
import styles from "../cloud/cloud-faq.module.css";

export function AnalyticsFaq() {
  return <section className={shared.section} aria-labelledby="analytics-faq-title" data-cloud-section="FAQ">
    <ServiceFaqContent page="services/analytics-bi"
      heading={<>
        <h2 id="analytics-faq-title">Frequently Asked Questions</h2>
        <p className={styles.introduction}>{analyticsContent.faqIntroduction}</p>
        <div className={styles.contactFallback}>
          <p className={styles.contactPrompt}>Can’t find the answer you’re looking for?</p>
          <p className={styles.contactHelp}>Reach out to us at <a className={shared.faqEmail} href="mailto:contact@vyntics.com">contact@vyntics.com</a> and we’ll be happy to help.</p>
        </div>
      </>}
      name="analytics-bi-faq"
      label="Analytics & BI questions"
    />
  </section>;
}
