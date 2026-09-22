import { Capabilities } from "@/components/sections/home/capabilities";
import { ClientMarquee } from "@/components/sections/home/client-marquee";
import { FeaturedWork } from "@/components/sections/home/featured-work";
import { Hero } from "@/components/sections/home/hero";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ClientMarquee />
      <FeaturedWork />
      <Capabilities />
    </>
  );
}
