import { OpticalHeadingAlignment } from "@/components/layout/optical-heading-alignment";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader, SiteHeaderSpacer } from "@/components/layout/site-header";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <OpticalHeadingAlignment />
      <SiteHeader />
      <SiteHeaderSpacer />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
