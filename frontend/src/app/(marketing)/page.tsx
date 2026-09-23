import { Approach } from "@/components/sections/home/approach";
import { Capabilities } from "@/components/sections/home/capabilities";
import { ClientMarquee } from "@/components/sections/home/client-marquee";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { FeaturedWork } from "@/components/sections/home/featured-work";
import { Hero } from "@/components/sections/home/hero";
import { Testimonials } from "@/components/sections/home/testimonials";
import { WhyVyntics } from "@/components/sections/home/why-vyntics";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ClientMarquee />
      <FeaturedWork />
      <Capabilities />
      <Approach />
      <WhyVyntics />
      <Testimonials />
      <ContactCta />
    </>
  );
}
