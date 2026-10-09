import { Suspense } from "react";
import { getBlogs } from "@/lib/blogs";
import { Approach } from "@/components/sections/home/approach";
import { BlogShowcase } from "@/components/sections/home/blog-showcase";
import { Capabilities } from "@/components/sections/home/capabilities";
import { ClientMarquee } from "@/components/sections/home/client-marquee";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { FeaturedWork } from "@/components/sections/home/featured-work";
import { Hero } from "@/components/sections/home/hero";
import { Testimonials } from "@/components/sections/home/testimonials";
import { WhyVyntics } from "@/components/sections/home/why-vyntics";

async function LatestBlogs() {
  const result = await getBlogs();
  return <BlogShowcase blogs={result.blogs.slice(0, 5)} unavailable={result.status === "error"} />;
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ClientMarquee />
      <Suspense fallback={<FeaturedWork loading />}><FeaturedWork /></Suspense>
      <Capabilities linkCards />
      <Testimonials />
      <Approach />
      <Suspense fallback={<BlogShowcase blogs={[]} loading />}><LatestBlogs /></Suspense>
      <WhyVyntics />
      <ContactCta />
    </>
  );
}
