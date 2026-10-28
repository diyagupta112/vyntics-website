import type { ComponentProps } from "react";
import { FaqContent } from "@/components/pages/faq-content";
import { getFaqs } from "@/lib/faqs";

type ServiceFaqContentProps = Omit<ComponentProps<typeof FaqContent>, "items"> & { page: string; subPage?: string };

/** FaqContent fed by the backend FAQ list for one page; renders nothing when there are none. */
export async function ServiceFaqContent({ page, subPage, ...presentation }: ServiceFaqContentProps) {
  const items = await getFaqs(page, subPage);
  if (!items.length) return null;
  return <FaqContent {...presentation} items={items} />;
}
