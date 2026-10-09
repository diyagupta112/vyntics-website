import { OpticalHeadingAlignment } from "@/components/layout/optical-heading-alignment";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader, SiteHeaderSpacer } from "@/components/layout/site-header";
import { SmoothScroll } from "@/components/layout/smooth-scroll";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <OpticalHeadingAlignment />
      <SiteHeader />
      <SmoothScroll>
        <SiteHeaderSpacer />
        <main>{children}</main>
        <SiteFooter />
      </SmoothScroll>
    </>
  );
}
