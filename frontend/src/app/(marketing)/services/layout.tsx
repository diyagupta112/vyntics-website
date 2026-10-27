import type { ReactNode } from "react";

/** Marks every service page (main pages and sub-pages) so one shared spacing rule can apply to them. */
export default function ServicesLayout({ children }: { children: ReactNode }) {
  return <div data-service-pages>{children}</div>;
}
