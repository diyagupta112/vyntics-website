import { FaqContent } from "@/components/pages/faq-content";
import { crmContent as content } from "./crm-revenue-ops-content";
import shared from "@/app/(marketing)/recognitions/page.module.css";
import styles from "../cloud/cloud-faq.module.css";

export function PageFaq() {
  return <section className={shared.section} aria-labelledby="crm-faq-title" data-cloud-section="FAQ">
    <FaqContent
      heading={<>
        <h2 id="crm-faq-title">{content.faq.heading}</h2>
        <p className={styles.introduction}>{content.faq.introduction}</p>
        <div className={styles.contactFallback}>
          <p className={styles.contactPrompt}>{content.faq.contactPrompt}</p>
          <p className={styles.contactHelp}>{content.faq.contactHelp} <a className={shared.faqEmail} href="mailto:contact@vyntics.com">contact@vyntics.com</a> {content.faq.contactSuffix}</p>
        </div>
      </>}
      items={content.faq.items}
      name="crm-solutions-faq"
      label={`${content.name} questions`}
    />
  </section>;
}
