import { Suspense, type ComponentProps } from "react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { FaqContent } from "@/components/pages/faq-content";
import { getFaqs } from "@/lib/faqs";
import styles from "@/app/(marketing)/recognitions/page.module.css";

type ServiceFaqContentProps = Omit<ComponentProps<typeof FaqContent>, "items"> & { page: string; subPage?: string };

/** FaqContent fed by the backend FAQ list for one page; renders nothing when there are none. */
async function LoadedFaqContent({ page, subPage, ...presentation }: ServiceFaqContentProps) {
  const items = await getFaqs(page, subPage);
  if (!items.length) return null;
  return <FaqContent {...presentation} items={items} />;
}

/** Same container and heading as the loaded FAQ, with question-sized rows until the list arrives. */
function FaqSkeleton({ heading, label }: { heading: ServiceFaqContentProps["heading"]; label: string }) {
  return <Container className={styles.faqLayout} aria-busy="true">
    <div className={styles.sectionHeading}>{heading}</div>
    <div className={styles.faq} role="status" aria-label={`Loading ${label}`}>
      {[0, 1, 2, 3].map((index) => <Skeleton key={index} style={{ height: "3.5rem", borderRadius: ".75rem", marginBottom: ".75rem" }} />)}
    </div>
  </Container>;
}

export function ServiceFaqContent(props: ServiceFaqContentProps) {
  return <Suspense fallback={<FaqSkeleton heading={props.heading} label={props.label} />}><LoadedFaqContent {...props} /></Suspense>;
}
