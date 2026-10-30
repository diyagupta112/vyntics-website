import { ContactLinkScroll } from "@/components/layout/contact-link-scroll";
import { OpticalHeadingAlignment } from "@/components/layout/optical-heading-alignment";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeaderBadges } from "@/components/layout/header-badges";
import { SiteHeader, SiteHeaderSpacer } from "@/components/layout/site-header";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <OpticalHeadingAlignment />
      <ContactLinkScroll />
      <SiteHeader badges={<HeaderBadges />} mobileBadges={<HeaderBadges variant="drawer" />} />
      <SiteHeaderSpacer />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
