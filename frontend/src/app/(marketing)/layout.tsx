import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader, SiteHeaderSpacer } from "@/components/layout/site-header";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <SiteHeaderSpacer />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
